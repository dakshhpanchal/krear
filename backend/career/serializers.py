from rest_framework import serializers
from .models import CareerEntry, Skill, Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'full_name', 'phone', 'email', 'linkedin_url', 'github_url', 'location']
        read_only_fields = ['id']

class CareerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerEntry
        fields = [
            'id', 'category', 'title', 'description',
            'tech_stack', 'metrics', 'tags',
            'duration_start', 'duration_end',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'proficiency', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']