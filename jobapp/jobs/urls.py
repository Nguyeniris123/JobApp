from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('candidates', views.CandidateViewSet, basename='candidate')
router.register('recruiters', views.RecruiterViewSet, basename='recruiter')
router.register('jobposts', views.JobPostViewSet, basename='jobpost')
router.register('applications', views.ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
]
