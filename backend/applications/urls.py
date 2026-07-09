from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register('applications', ApplicationViewSet, basename='application')
router.register('activity-logs', ActivityLogViewSet, basename='activity-log')

urlpatterns = router.urls