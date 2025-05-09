from rest_framework import permissions
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import ValidationError
from jobs.models import Application, User, Company, Application

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

class CanCandidateReview(permissions.BasePermission):
    # Chỉ cho phép tạo đánh giá nếu ứng viên đăng nhập và có một application được chấp nhận giữa họ và nhà tuyển dụng
    def has_permission(self, request, view):
        reviewer = request.user
        company_id = request.data.get('company_id')  # Lấy company_id từ dữ liệu gửi lên

        if not reviewer.is_authenticated:
            return False

        if not company_id:
            raise ValidationError("company_id không được để trống.")

        try:
            # Lấy công ty từ company_id
            company = Company.objects.get(id=company_id)
            # Lấy nhà tuyển dụng từ công ty
            reviewed_user = company.user  # Công ty chỉ có một nhà tuyển dụng (recruiter)
        except Company.DoesNotExist:
            raise ValidationError("Công ty không tồn tại.")

        # Kiểm tra xem có application nào được chấp nhận giữa reviewer và reviewed_user không
        return self.check_application_status(reviewer, reviewed_user)

    def check_application_status(self, reviewer, reviewed_user):
        # Kiểm tra application được chấp nhận giữa reviewer và reviewed_user
        return Application.objects.filter(
            applicant=reviewer,
            job__recruiter=reviewed_user,
            status='accepted'
        ).exists() or Application.objects.filter(
            applicant=reviewed_user,
            job__recruiter=reviewer,
            status='accepted'
        ).exists()

class CanRecruiterReview(permissions.BasePermission):
    # Chỉ cho phép nhà tuyển dụng đánh giá ứng viên nếu có một application được chấp nhận giữa họ.
    def has_permission(self, request, view):
        reviewer = request.user
        candidate_id = request.data.get('candidate_id')

        if not reviewer.is_authenticated:
            return False

        if reviewer.role != "recruiter":
            return False

        if not candidate_id:
            raise ValidationError("candidate_id không được để trống.")

        try:
            reviewed_user = User.objects.get(id=candidate_id, role='candidate')
        except User.DoesNotExist:
            raise ValidationError("Ứng viên không tồn tại.")

        return self.check_application_status(reviewer, reviewed_user)

    def check_application_status(self, recruiter, candidate):
        return Application.objects.filter(
            applicant=candidate,
            job__recruiter=recruiter,
            status='accepted'
        ).exists()

class DeleteReview(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj) and request.user == obj.reviewer