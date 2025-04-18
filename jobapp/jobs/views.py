from django.db.models import Q
from django.http import JsonResponse
from rest_framework import viewsets, status, generics, parsers, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import action
from . import serializers, perms, paginators
from .perms import ApplicationPerms, IsCandidate, IsRecruiterApplication, IsRecruiter, IsRecruiterCompany
from .serializers import CandidateSerializer, RecruiterSerializer, JobPostSerializer, ApplicationSerializer, FollowSerializer, CompanySerializer
from .models import User, JobPost, Application, Follow, Company


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

class JobPostViewSet(viewsets.ModelViewSet):
    serializer_class = JobPostSerializer
    pagination_class = paginators.JobPostPaginator

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'recruiter_job_post']:
            return [perms.IsRecruiter()]
        return [permissions.AllowAny()]

    def filter_job_posts(self, queryset):
        params = self.request.query_params

        # Lọc
        if (specialized := params.get('specialized')):
            queryset = queryset.filter(specialized__icontains=specialized)

        if (location := params.get('location')):
            queryset = queryset.filter(location__icontains=location)

        if (salary_gte := params.get('salary__gte')):
            queryset = queryset.filter(salary__gte=salary_gte)

        if (salary_lte := params.get('salary__lte')):
            queryset = queryset.filter(salary__lte=salary_lte)

        if (hours_gte := params.get('working_hours__gte')):
            queryset = queryset.filter(working_hours__gte=hours_gte)

        if (hours_lte := params.get('working_hours__lte')):
            queryset = queryset.filter(working_hours__lte=hours_lte)

        # Tìm kiếm gần đúng
        if (search := params.get('search')):
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(specialized__icontains=search) |
                Q(location__icontains=search)
            )

        # Sắp xếp
        ordering = params.get('ordering', '-created_date')
        queryset = queryset.order_by(ordering)

        return queryset

    def get_queryset(self):
        queryset = JobPost.objects.filter(active=True)
        return self.filter_job_posts(queryset)

    @action(detail=False, methods=['get'], permission_classes=[perms.IsRecruiter])
    def recruiter_job_post(self, request):
        queryset = JobPost.objects.filter(recruiter=request.user, active=True)
        queryset = self.filter_job_posts(queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
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