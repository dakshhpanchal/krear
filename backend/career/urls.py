from rest_framework.routers import DefaultRouter
from .views import CareerEntryViewSet, SkillViewSet
router = DefaultRouter()
router.register('career-entries', CareerEntryViewSet, basename='career-entry')
router.register('skills', SkillViewSet, basename='skill')

urlpatterns = router.urls