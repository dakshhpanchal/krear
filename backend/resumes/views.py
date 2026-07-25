from rest_framework import viewsets
from .models import JobDescription, Resume, ResumeVersion, CoverLetter
from .serializers import (
    JobDescriptionSerializer, ResumeSerializer,
    ResumeVersionSerializer, CoverLetterSerializer,
)
from rest_framework.decorators import action
from rest_framework.response import Response
from career.serializers import CareerEntrySerializer
from career.services import get_relevant_entries, compute_match_score

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResumeVersionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ResumeVersionSerializer

    def get_queryset(self):
        return ResumeVersion.objects.filter(resume__user=self.request.user)


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