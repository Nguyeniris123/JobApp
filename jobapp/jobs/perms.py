from rest_framework import permissions
from rest_framework.permissions import BasePermission


class OwnerPerms(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj) and request.user == obj


class JobPostPerms(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        # Chặn ngay từ đầu nếu user không phải recruiter
        return super().has_permission(request, view) and request.user.role == 'recruiter'

    def has_object_permission(self, request, view, obj):
        # Chỉ recruiter đăng bài mới được sửa/xóa bài của chính mình
        return obj.recruiter == request.user

class ApplicationCandidatePerms(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == "candidate"

    def has_object_permission(self, request, view, obj):
        return obj.applicant == request.user  # Ứng viên chỉ thao tác trên hồ sơ của chính họ