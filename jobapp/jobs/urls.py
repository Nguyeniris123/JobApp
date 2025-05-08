from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.urls import path

router = DefaultRouter()
router.register('candidates', views.CandidateViewSet, basename='candidate')
router.register('recruiters', views.RecruiterViewSet, basename='recruiter')
router.register('avatars', views.UpdateAvatarViewSet, basename='avatar')
router.register('companys', views.CompanyViewSet, basename='company')
router.register('jobposts', views.JobPostViewSet, basename='jobpost')
router.register('applications', views.ApplicationViewSet, basename='application')
router.register('follow', views.FollowViewSet, basename='follow')
router.register('review_recruiters', views.CandidateReviewRecruiterViewSet, basename='review_recruiter')
router.register('review_candidates', views.RecruiterReviewCandidateViewSet, basename='review_candidate')



urlpatterns = [
    path('', include(router.urls)),
]
