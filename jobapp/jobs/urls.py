from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.urls import path
from .views import test_send_email

router = DefaultRouter()
router.register('candidates', views.CandidateViewSet, basename='candidate')
router.register('recruiters', views.RecruiterViewSet, basename='recruiter')
router.register('companys', views.CompanyViewSet, basename='company')
router.register('jobposts', views.JobPostViewSet, basename='jobpost')
router.register('applications', views.ApplicationViewSet, basename='application')
router.register('follow', views.FollowViewSet, basename='follow')


urlpatterns = [
    path('', include(router.urls)),
    path("test-email/", test_send_email, name="test-email"),
]
