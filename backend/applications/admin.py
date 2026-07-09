from django.contrib import admin
from .models import Application, ActivityLog

admin.site.register(Application)
admin.site.register(ActivityLog)