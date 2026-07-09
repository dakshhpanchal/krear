from django.db import models
from django.conf import settings
from pgvector.django import VectorField

class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class CareerEntry(TimestampedModel):
    CATEGORY_CHOICES = [
        ('project', 'Project'),
        ('experience', 'Experience'),
        ('education', 'Education'),
        ('achievement', 'Achievement'),
        ('certification', 'Certification'),
        ('award', 'Award'),
        ('leadership', 'Leadership'),
        ('publication', 'Publication'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='career_entries')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()

    tech_stack = models.JSONField(default=list, blank=True)
    metrics = models.JSONField(default=list, blank=True)   
    tags = models.JSONField(default=list, blank=True)
    duration_start = models.DateField(null=True, blank=True)
    duration_end = models.DateField(null=True, blank=True)

    embedding = VectorField(dimensions=384, null=True, blank=True)
    embedding_model = models.CharField(max_length=50, default='bge-small-en-v1.5')

    def __str__(self):
        return f"{self.title} ({self.category})"

    class Meta:
        ordering = ['-duration_start']
        verbose_name = 'career entry'
        verbose_name_plural = 'career entries'

class Skill(TimestampedModel):
    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, blank=True)   # e.g. "Language", "Framework", "Tool"
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='intermediate')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['category', 'name']
        unique_together = ('user', 'name')