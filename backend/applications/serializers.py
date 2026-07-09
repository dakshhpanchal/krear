from rest_framework import serializers
from .models import Application, ActivityLog


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            'id', 'company', 'role', 'job_description', 'resume_version',
            'cover_letter', 'status', 'applied_date', 'deadline',
            'recruiter_contact', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'action', 'entity_type', 'entity_id', 'created_at']
        read_only_fields = fields