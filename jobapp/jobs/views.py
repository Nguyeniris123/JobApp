from rest_framework import viewsets, status, generics, parsers, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, permission_classes
from . import serializers, perms
from .serializers import CandidateSerializer, RecruiterSerializer, JobPostSerializer
from .models import User, JobPost


class CandidateViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.CandidateSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [perms.OwnerPerms()]
        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        return Response(self.serializer_class(request.user).data)

class RecruiterViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.RecruiterSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [perms.OwnerPerms()]
        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        return Response(self.serializer_class(request.user).data)

class JobPostViewSet(viewsets.ModelViewSet):
    queryset = JobPost.objects.filter(active=True)
    serializer_class = serializers.JobPostSerializer

    def get_permissions(self):
        # Chỉ recruiter mới được đăng, sửa, xóa
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [perms.JobPostPerms()]
        # Ai cũng xem được danh sách và chi tiết tin tuyển dụng
        return [permissions.AllowAny()]

