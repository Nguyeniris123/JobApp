from rest_framework import permissions
from rest_framework.permissions import BasePermission


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
        #Nhà tuyển dụng chỉ có thể thao tác trên đơn ứng tuyển thuộc job của họ
        return obj.job.recruiter == request.user

class ApplicationPerms(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.is_authenticated

class IsCandidate(permissions.BasePermission):
   # Chỉ cho phép ứng viên (candidate) tạo đơn ứng tuyển, theo dõi recruiter
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "candidate"



