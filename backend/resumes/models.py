from django.db import models
from django.conf import settings
from pgvector.django import VectorField
from career.models import TimestampedModel


class JobDescription(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_descriptions')
    raw_text = models.TextField()
    company = models.CharField(max_length=255, blank=True)
    role_title = models.CharField(max_length=255, blank=True)

    parsed_requirements = models.JSONField(null=True, blank=True)  # filled in Phase 5
    embedding = VectorField(dimensions=384, null=True, blank=True)
    embedding_model = models.CharField(max_length=50, default='bge-small-en-v1.5')

    def __str__(self):
        return f"{self.role_title or 'Untitled'} @ {self.company or 'Unknown'}"


class Resume(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    job_description = models.ForeignKey(JobDescription, on_delete=models.SET_NULL, null=True, blank=True, related_name='resumes')
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class ResumeVersion(TimestampedModel):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    content = models.JSONField()                       # structured resume sections/bullets
    diff_from_previous = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-version_number']
        unique_together = ('resume', 'version_number')

    def __str__(self):
        return f"{self.resume.title} v{self.version_number}"


class CoverLetter(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cover_letters')
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='cover_letters')
    resume_version = models.ForeignKey(ResumeVersion, on_delete=models.SET_NULL, null=True, blank=True, related_name='cover_letters')
    content = models.TextField()

    def __str__(self):
        return f"Cover letter for {self.job_description}"