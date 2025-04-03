from django.http import JsonResponse
from rest_framework import viewsets, status, generics, parsers, permissions, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import action, permission_classes
from . import serializers, perms, paginators
from .perms import ApplicationPerms, IsCandidate, IsRecruiterApplication, IsRecruiter, IsRecruiterCompany
from .serializers import CandidateSerializer, RecruiterSerializer, JobPostSerializer, ApplicationSerializer, \
    CustomOAuth2TokenSerializer, FollowSerializer, CompanySerializer
from .models import User, JobPost, Application, Follow, Company
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

class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsRecruiterCompany]
    http_method_names = ["get", "put", "patch"]

    def get_queryset(self):
        return Company.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        company = self.get_object()
        if company.user != request.user:
            raise PermissionDenied("Bạn không có quyền chỉnh sửa công ty này!")
        return super().update(request, *args, **kwargs)


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
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'recruiter_job_post']:
            return [perms.IsRecruiter()]
        # Ai cũng xem được danh sách và chi tiết tin tuyển dụng
        return [permissions.AllowAny()]


    @action(detail=False, methods=['get'], permission_classes=[perms.IsRecruiter])
    def recruiter_job_post(self, request):
        # Lấy danh sách JobPost của nhà tuyển dụng hiện tại
        job_posts = JobPost.objects.filter(recruiter=request.user, active=True)

        # Áp dụng bộ lọc, tìm kiếm, sắp xếp
        job_posts = self.filter_queryset(job_posts)

        # Phân trang
        page = self.paginate_queryset(job_posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # Nếu không phân trang, trả về toàn bộ
        serializer = self.get_serializer(job_posts, many=True)
        return Response(serializer.data)

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    http_method_names = ["get", "post", "patch"]

    def get_queryset(self):
        # Lọc danh sách đơn ứng tuyển dựa trên role của user
        user = self.request.user  # lấy thông tin user hiện tại
        if user.role == "candidate":
            return Application.objects.filter(applicant=user, active=True)
        elif user.role == "recruiter":
            return Application.objects.filter(job__recruiter=user, active=True)

    def get_permissions(self):
        if self.action in ["list", "create", "retrieve", "update"]:
            return [IsCandidate()]  # Chỉ ứng viên mới có thể tạo đơn ứng tuyển
        if self.action in ["list_for_recruiter", "accept_application", "reject_application"]:
            return [IsRecruiterApplication()]  # Chỉ nhà tuyển dụng mới có thể xem, sửa danh sách đơn ứng tuyển
        return [ApplicationPerms()]

    @action(detail=False, methods=["get"], url_path="recruiter", permission_classes=[IsRecruiterApplication])
    def list_for_recruiter(self, request):
        # Nhà tuyển dụng xem danh sách đơn ứng tuyển vào job của họ
        queryset = Application.objects.filter(job__recruiter=request.user, active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="accept", permission_classes=[IsRecruiterApplication])
    def accept_application(self, request, pk=None):
        # Nhà tuyển dụng chấp nhận đơn ứng tuyển
        application = self.get_object()

        if application.job.recruiter != request.user:
            raise PermissionDenied("Bạn không có quyền chấp nhận đơn ứng tuyển này.")

        application.status = "accepted"
        application.save()
        return Response({"message": "Đơn ứng tuyển đã được chấp nhận."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="reject", permission_classes=[IsRecruiterApplication])
    def reject_application(self, request, pk=None):
        # Nhà tuyển dụng từ chối đơn ứng tuyển
        application = self.get_object()

        if application.job.recruiter != request.user:
            raise PermissionDenied("Bạn không có quyền từ chối đơn ứng tuyển này.")

        application.status = "rejected"
        application.save()
        return Response({"message": "Đơn ứng tuyển đã bị từ chối."}, status=status.HTTP_200_OK)


class FollowViewSet(viewsets.ModelViewSet):
    serializer_class = FollowSerializer
    http_method_names = ["get", "post", "delete"]

    def get_queryset(self):
        # Ứng viên chỉ xem danh sách những nhà tuyển dụng mình đang theo dõi
        return Follow.objects.filter(follower=self.request.user)

    def get_permissions(self):
        if self.action in ["creat", "list", "destroy"]:
            return [IsCandidate()]  # Chỉ ứng viên mới có thể follow
        return super().get_permissions()

    def destroy(self, request, *args, **kwargs):
        # Ứng viên có thể bỏ theo dõi nhà tuyển dụng
        instance = self.get_object()
        instance.delete()
        return Response({"detail": "Đã hủy theo dõi"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["GET"], url_path="recruiter-followers")
    def my_followers(self, request):
        # Nhà tuyển dụng xem danh sách ứng viên follow mình
        if request.user.role != "recruiter":
            return Response({"error": "Bạn không phải nhà tuyển dụng!"}, status=status.HTTP_403_FORBIDDEN)

        followers = Follow.objects.filter(recruiter=request.user)
        data = CandidateSerializer([follow.follower for follow in followers], many=True).data
        return Response(data, status=status.HTTP_200_OK)