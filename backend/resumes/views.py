from django.http import HttpResponse
from rest_framework import viewsets
from .models import JobDescription, Resume, ResumeVersion, CoverLetter
from .serializers import (
    JobDescriptionSerializer, ResumeSerializer,
    ResumeVersionSerializer, CoverLetterSerializer,
)
from rest_framework.decorators import action
from rest_framework.response import Response
from career.serializers import CareerEntrySerializer
from career.services import get_relevant_entries, compute_match_score, compute_ats_score
from .ats import check_parseability
from .tasks import generate_resume


class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        resume = self.get_object()
        if not resume.job_description_id:
            return Response({"error": "This resume has no linked job description."}, status=400)
        resume.generation_progress = 0
        resume.generation_status = "Queued for generation..."
        resume.save(update_fields=['generation_progress', 'generation_status'])
        generate_resume.delay(resume.id, resume.job_description_id)
        return Response({"status": "generation started"}, status=202)


class ResumeVersionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ResumeVersionSerializer

    def get_queryset(self):
        qs = ResumeVersion.objects.filter(resume__user=self.request.user)
        resume_id = self.request.query_params.get('resume')
        if resume_id:
            qs = qs.filter(resume_id=resume_id)
        return qs.order_by('-version_number')

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        version = self.get_object()
        if not version.pdf_data:
            return Response({"error": "This resume version has no compiled PDF yet."}, status=404)

        response = HttpResponse(bytes(version.pdf_data), content_type='application/pdf')
        filename = version.pdf_filename or f"resume_v{version.version_number}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    @action(detail=True, methods=['get'])
    def ats_score(self, request, pk=None):
        version = self.get_object()
        if not version.pdf_data:
            return Response(
                {"error": "This resume version has no compiled PDF yet"},
                status=400,
            )

        pdf_bytes = bytes(version.pdf_data)

        expected_sections = ["Education", "Personal Projects", "Experience", "Technical Skills"]
        parseability_result = check_parseability(pdf_bytes, expected_sections)

        jd = version.resume.job_description
        match_result = compute_match_score(request.user, jd) if jd else None

        if match_result is None:
            return Response(
                {"error": "Job description has not been parsed yet — cannot compute content match score.",
                 "parseability_score": parseability_result["score"],
                 "parseability_issues": parseability_result["issues"]},
                status=200,
            )

        breakdown = compute_ats_score(match_result['overall_score'], parseability_result)
        breakdown['missing_required'] = match_result['missing_required']
        breakdown['missing_preferred'] = match_result['missing_preferred']
        return Response(breakdown)


class CoverLetterViewSet(viewsets.ModelViewSet):
    serializer_class = CoverLetterSerializer

    def get_queryset(self):
        return CoverLetter.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class JobDescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = JobDescriptionSerializer

    def get_queryset(self):
        return JobDescription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def relevant_entries(self, request, pk=None):
        jd = self.get_object()
        entries = get_relevant_entries(request.user, jd.embedding, top_n=5)
        serializer = CareerEntrySerializer(entries, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def match_score(self, request, pk=None):
        jd = self.get_object()
        score = compute_match_score(request.user, jd)
        if score is None:
            return Response({'detail': 'JD not yet parsed'}, status=202)
        return Response(score)