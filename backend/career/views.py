from rest_framework import viewsets
from rest_framework.response import Response
from .models import CareerEntry, Skill, Profile
from .serializers import CareerEntrySerializer, SkillSerializer, ProfileSerializer

class CareerEntryViewSet(viewsets.ModelViewSet):
    serializer_class = CareerEntrySerializer

    def get_queryset(self):
        return CareerEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProfileViewSet(viewsets.ViewSet):
    """Single-object viewset: always operates on the current user's own profile,
    auto-creating it on first access. Frontend calls GET/PATCH on /api/profile/me/."""

    def list(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response(ProfileSerializer(profile).data)

    def retrieve(self, request, pk=None):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response(ProfileSerializer(profile).data)

    def partial_update(self, request, pk=None):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)