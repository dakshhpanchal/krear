from django.db import models
from django.conf import settings
from career.models import TimestampedModel
from resumes.models import JobDescription, ResumeVersion, CoverLetter


class Application(TimestampedModel):
    STATUS_CHOICES = [
        ('wishlist', 'Wishlist'),
        ('applied', 'Applied'),
        ('oa', 'Online Assessment'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    job_description = models.ForeignKey(JobDescription, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    resume_version = models.ForeignKey(ResumeVersion, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    cover_letter = models.ForeignKey(CoverLetter, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='wishlist')
    applied_date = models.DateField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    recruiter_contact = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.role} @ {self.company} ({self.status})"


class ActivityLog(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=50)
    entity_id = models.PositiveIntegerField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} on {self.entity_type} #{self.entity_id}"