from rest_framework import serializers
from .models import JobDescription, Resume, ResumeVersion, CoverLetter


class JobDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = [
            'id', 'raw_text', 'company', 'role_title',
            'parsed_requirements', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'parsed_requirements', 'created_at', 'updated_at']


class ResumeVersionSerializer(serializers.ModelSerializer):
    has_pdf = serializers.SerializerMethodField()

    class Meta:
        model = ResumeVersion
        fields = [
            'id', 'resume', 'version_number', 'content',
            'has_pdf', 'pdf_filename', 'diff_from_previous', 'created_at',
        ]
        read_only_fields = [
            'id', 'version_number', 'has_pdf', 'pdf_filename',
            'diff_from_previous', 'created_at',
        ]

    def get_has_pdf(self, obj):
        return bool(obj.pdf_data)


class ResumeSerializer(serializers.ModelSerializer):
    versions = ResumeVersionSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'job_description', 'title', 'versions', 'generation_progress', 'generation_status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CoverLetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoverLetter
        fields = [
            'id', 'job_description', 'resume_version', 'content',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']