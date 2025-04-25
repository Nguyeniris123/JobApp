from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.urls import path

router = DefaultRouter()
router.register('candidates', views.CandidateViewSet, basename='candidate')
router.register('recruiters', views.RecruiterViewSet, basename='recruiter')
router.register('companys', views.CompanyViewSet, basename='company')
router.register('jobposts', views.JobPostViewSet, basename='jobpost')
router.register('applications', views.ApplicationViewSet, basename='application')
router.register('follow', views.FollowViewSet, basename='follow')
router.register('reviews', views.ReviewViewSet, basename='review')



urlpatterns = [
    path('', include(router.urls)),
]
