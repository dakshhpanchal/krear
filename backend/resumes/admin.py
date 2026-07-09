from django.contrib import admin
from .models import JobDescription, Resume, ResumeVersion, CoverLetter

admin.site.register(JobDescription)
admin.site.register(Resume)
admin.site.register(ResumeVersion)
admin.site.register(CoverLetter)