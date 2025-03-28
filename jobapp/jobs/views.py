from rest_framework import viewsets, status, generics, parsers, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import action, permission_classes
from . import serializers, perms, paginators
from .perms import ApplicationPerms
from .serializers import CandidateSerializer, RecruiterSerializer, JobPostSerializer, ApplicationSerializer
from .models import User, JobPost, Application
from django_filters.rest_framework import DjangoFilterBackend



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
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

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
    pagination_class = paginators.JobPostPaginator

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]

    # Lọc theo ngành nghề, mức lương, số giờ làm việc, địa điểm
    filterset_fields = {
        'specialized': ['icontains'],  # Tìm kiếm gần đúng theo ngành nghề
        'salary': ['gte', 'lte'],  # Lọc mức lương từ - đến
        'working_hours': ['gte', 'lte'],  # Lọc số giờ làm việc từ - đến
        'location': ['icontains'],  # Tìm kiếm gần đúng theo địa điểm
    }
    # vd: http://127.0.0.1:8000/job-posts/?specialized=IT&salary__gte=5000&salary__lte=10000

    # Sắp xếp theo lương, số giờ làm việc, ngày đăng
    ordering_fields = ['salary', 'working_hours', 'created_date']
    ordering = ['-created_date']  # Mặc định sắp xếp theo ngày đăng giảm dần

    # Tìm kiếm theo tiêu đề, ngành nghề, địa điểm
    search_fields = ['title', 'specialized', 'location']


    def get_permissions(self):
        # Chỉ recruiter mới được đăng, sửa, xóa
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [perms.JobPostPerms()]
        # Ai cũng xem được danh sách và chi tiết tin tuyển dụng
        return [permissions.AllowAny()]

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [ApplicationPerms]

    def get_queryset(self):
        # Lọc danh sách đơn ứng tuyển dựa trên role của user
        user = self.request.user #lấy thông tin user hiện tại
        if user.role == "candidate":
            return Application.objects.filter(applicant=user, active=True)
        elif user.role == "recruiter":
            return Application.objects.filter(job__recruiter=user, active=True)
        return Application.objects.none() #Nếu không phải candidate hoặc recruiter, trả về queryset rỗng, không thấy đơn ứng tuyển nào

    @action(detail=True, methods=["patch"], permission_classes=[ApplicationPerms])
    def update_status(self, request, pk=None):
        # Nhà tuyển dụng cập nhật trạng thái đơn ứng tuyển
        application = self.get_object()

        # Không cần kiểm tra quyền vì đã có `ApplicationPerms`
        new_status = request.data.get("status")
        if new_status not in ["pending", "accepted", "rejected"]:
            return Response({"error": "Trạng thái không hợp lệ!"}, status=status.HTTP_400_BAD_REQUEST)

        application.status = new_status
        application.save(update_fields=["status"])
        return Response(ApplicationSerializer(application).data, status=status.HTTP_200_OK)