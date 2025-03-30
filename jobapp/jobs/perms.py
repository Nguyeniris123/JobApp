from rest_framework import permissions
from rest_framework.permissions import BasePermission


class OwnerPerms(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj) and request.user == obj


class IsRecruiter(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        # Chặn ngay từ đầu nếu user không phải recruiter
        return super().has_permission(request, view) and request.user.role == 'recruiter'

    def has_object_permission(self, request, view, obj):
        # Chỉ recruiter đăng bài mới được sửa/xóa bài của chính mình
        return obj.recruiter == request.user

class IsCandidate(permissions.BasePermission):
   # Chỉ cho phép ứng viên (candidate) tạo đơn ứng tuyển, theo dõi recruiter
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "candidate"

class ApplicationPerms(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == "candidate":
            return obj.applicant == request.user  # Ứng viên chỉ xem đơn của chính họ
        elif request.user.role == "recruiter":
            return obj.job.recruiter == request.user  # Nhà tuyển dụng duyệt đơn ứng tuyển vào job của họ
        return False