from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('career.urls')),
    path('api/', include('resumes.urls')),
    path('api/', include('applications.urls')),
]