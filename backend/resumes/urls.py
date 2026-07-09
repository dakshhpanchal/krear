from rest_framework.routers import DefaultRouter
from .views import (
    JobDescriptionViewSet, ResumeViewSet,
    ResumeVersionViewSet, CoverLetterViewSet,
)

router = DefaultRouter()
router.register('job-descriptions', JobDescriptionViewSet, basename='job-description')
router.register('resumes', ResumeViewSet, basename='resume')
router.register('resume-versions', ResumeVersionViewSet, basename='resume-version')
router.register('cover-letters', CoverLetterViewSet, basename='cover-letter')

urlpatterns = router.urls