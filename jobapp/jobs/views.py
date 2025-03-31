from django.http import JsonResponse
from rest_framework import viewsets, status, generics, parsers, permissions, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import action, permission_classes
from . import serializers, perms, paginators
from .perms import ApplicationPerms, IsCandidate
from .serializers import CandidateSerializer, RecruiterSerializer, JobPostSerializer, ApplicationSerializer, \
    CustomOAuth2TokenSerializer, FollowSerializer
from .models import User, JobPost, Application, Follow
from django_filters.rest_framework import DjangoFilterBackend
from oauth2_provider.models import AccessToken
from oauth2_provider.views import TokenView
import json


class CandidateViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True, role='candidate')  # Chỉ lấy ứng viên
    serializer_class = CandidateSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [perms.OwnerPerms()]
        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        if request.user.role != 'candidate':  # Chặn nhà tuyển dụng truy cập
            return Response({"detail": "Bạn không có quyền truy cập."}, status=status.HTTP_403_FORBIDDEN)
        return Response(self.serializer_class(request.user).data)


class RecruiterViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True, role='recruiter')  # Chỉ lấy nhà tuyển dụng
    serializer_class = RecruiterSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [perms.OwnerPerms()]
        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        if request.user.role != 'recruiter':  # Chặn ứng viên truy cập
            return Response({"detail": "Bạn không có quyền truy cập."}, status=status.HTTP_403_FORBIDDEN)
        return Response(self.serializer_class(request.user).data)


class CustomOAuth2TokenView(TokenView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # Chuyển response thành JSON để xử lý
        if response.status_code == 200:
            response_data = json.loads(response.content)

            access_token = response_data.get("access_token")
            if access_token:
                try:
                    token_obj = AccessToken.objects.get(token=access_token)
                    response_data["user"] = CustomOAuth2TokenSerializer(token_obj).data["user"]
                except AccessToken.DoesNotExist:
                    pass

            return JsonResponse(response_data, status=200)

        return response


class JobPostViewSet(viewsets.ModelViewSet):
    queryset = JobPost.objects.filter(active=True)
    serializer_class = JobPostSerializer
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
            return [perms.IsRecruiter()]
        # Ai cũng xem được danh sách và chi tiết tin tuyển dụng
        return [permissions.AllowAny()]


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    http_method_names = ["get", "post", "patch"]  # Không có "delete"

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsCandidate()]  # Chặn recruiter POST
        return [ApplicationPerms()]  # GET thì áp dụng quyền bình thường

    def get_queryset(self):
        # Lọc danh sách đơn ứng tuyển dựa trên role của user
        user = self.request.user  # lấy thông tin user hiện tại
        if user.role == "candidate":
            return Application.objects.filter(applicant=user, active=True)
        elif user.role == "recruiter":
            return Application.objects.filter(job__recruiter=user, active=True)
        return Application.objects.none()  # Nếu không phải candidate hoặc recruiter, trả về queryset rỗng, không thấy đơn ứng tuyển nào

    # @action(detail=True, methods=["patch"], url_path='update-status', permission_classes=[ApplicationPerms])
    # def update_status(self, request, pk=None):
    #     # Nhà tuyển dụng cập nhật trạng thái đơn ứng tuyển
    #     application = self.get_object()
    #
    #     # Không cần kiểm tra quyền vì đã có `ApplicationPerms`
    #     new_status = request.data.get("status")
    #     if new_status not in ["pending", "accepted", "rejected"]:
    #         return Response({"error": "Trạng thái không hợp lệ!"}, status=status.HTTP_400_BAD_REQUEST)
    #
    #     application.status = new_status
    #     application.save(update_fields=["status"])
    #     return Response(ApplicationSerializer(application).data, status=status.HTTP_200_OK)

class FollowViewSet(viewsets.ModelViewSet):
    serializer_class = FollowSerializer
    permission_classes = [IsCandidate]
    http_method_names = ["get", "post", "delete"]

    def get_queryset(self):
        # Ứng viên chỉ xem danh sách những nhà tuyển dụng mình đang theo dõi
        return Follow.objects.filter(follower=self.request.user)

    def destroy(self, request, *args, **kwargs):
        # Ứng viên có thể bỏ theo dõi nhà tuyển dụng
        instance = self.get_object()
        instance.delete()
        return Response({"detail": "Đã hủy theo dõi"}, status=status.HTTP_204_NO_CONTENT)
