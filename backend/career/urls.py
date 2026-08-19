from rest_framework.routers import DefaultRouter
from .views import CareerEntryViewSet, SkillViewSet, ProfileViewSet
router = DefaultRouter()
router.register('career-entries', CareerEntryViewSet, basename='career-entry')
router.register('skills', SkillViewSet, basename='skill')
router.register('profile', ProfileViewSet, basename='profile')

urlpatterns = router.urls