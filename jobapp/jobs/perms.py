from rest_framework import permissions
from rest_framework.permissions import BasePermission

from jobs.models import Application, User


class OwnerPerms(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj) and request.user == obj


class IsRecruiterCompany(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        # Chặn ngay từ đầu nếu user không phải recruiter
        return super().has_permission(request, view) and request.user.role == 'recruiter'

    def has_object_permission(self, request, view, obj):
        # Chỉ recruiter đăng bài mới được sửa/xóa bài của chính mình
        return obj.user == request.user


class IsRecruiterJobPost(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        # Chặn ngay từ đầu nếu user không phải recruiter
        return super().has_permission(request, view) and request.user.role == 'recruiter'

    def has_object_permission(self, request, view, obj):
        # Chỉ recruiter đăng bài mới được sửa/xóa bài của chính mình
        return obj.recruiter == request.user


class IsRecruiterApplication(permissions.IsAuthenticated):
    # Chỉ cho phép nhà tuyển dụng (recruiter) truy cập
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'recruiter'

    def has_object_permission(self, request, view, obj):
        # Nhà tuyển dụng chỉ có thể thao tác trên đơn ứng tuyển thuộc job của họ
        return obj.job.recruiter == request.user


class ApplicationPerms(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.is_authenticated


class IsCandidate(permissions.BasePermission):
    # Chỉ cho phép ứng viên (candidate) tạo đơn ứng tuyển, theo dõi recruiter
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "candidate"


class CanReview(permissions.BasePermission):
    # Chỉ cho phép tạo đánh giá nếu người dùng đã đăng nhập và có một application được chấp nhận giữa họ và người được đánh giá
    def has_permission(self, request, view):
        reviewer = request.user
        reviewed_user_id = request.data.get('reviewed_user')

        if not reviewer.is_authenticated:
            return False

        reviewed_user = User.objects.get(id=reviewed_user_id)
        return self.check_application_status(reviewer, reviewed_user)

    def check_application_status(self, reviewer, reviewed_user):
        # Kiểm tra application được chấp nhận giữa reviewer và reviewed_user.
        return Application.objects.filter(
            applicant=reviewer,
            job__recruiter=reviewed_user,
            status='accepted'
        ).exists() or Application.objects.filter(
            applicant=reviewed_user,
            job__recruiter=reviewer,
            status='accepted'
        ).exists()

class DeleteReview(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj) and request.user == obj.reviewer