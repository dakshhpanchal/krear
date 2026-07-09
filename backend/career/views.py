from rest_framework import viewsets
from .models import CareerEntry, Skill
from .serializers import CareerEntrySerializer, SkillSerializer

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