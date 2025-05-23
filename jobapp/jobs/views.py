from django.db.models import Q
from rest_framework import viewsets, status, generics, parsers, permissions
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import action
from . import perms, paginators
from .serializers import CandidateSerializer, RecruiterSerializer, JobPostSerializer, ApplicationSerializer, \
    FollowSerializer, CompanySerializer, UpdateAvatarSerializer, RecruiterReviewCandidateSerializer, \
    CandidateReviewRecruiterSerializer, CompanyImageUploadSerializer
from .models import User, JobPost, Application, Follow, Company, Review


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

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [perms.OwnerPerms()]
        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        if request.user.role != 'recruiter':  # Chặn ứng viên truy cập
            return Response({"detail": "Bạn không có quyền truy cập."}, status=status.HTTP_403_FORBIDDEN)
        return Response(self.serializer_class(request.user).data)

    @action(detail=False, methods=['patch'], url_path='update-company-images')
    def update_company_images(self, request):
        user = request.user
        company = getattr(user, 'company', None)
        if not company:
            return Response({"detail": "Company not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CompanyImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update(company, serializer.validated_data)
            return Response(self.serializer_class(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateAvatarViewSet(viewsets.ViewSet, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UpdateAvatarSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [perms.OwnerPerms()]
        return [permissions.AllowAny()]

class CompanyViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView):
    serializer_class = CompanySerializer
    queryset = (Company.objects.filter(active=True))

    def get_permissions(self):
        if self.request.method in ['GET', 'PUT', 'PATCH']:
            return [perms.IsRecruiterCompany()]
        return [permissions.AllowAny()]

class JobPostViewSet(viewsets.ModelViewSet):
    serializer_class = JobPostSerializer
    pagination_class = paginators.JobPostPaginator

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'recruiter_job_post']:
            return [perms.IsRecruiterJobPost()]
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

    @action(detail=False, methods=['get'], permission_classes=[perms.IsRecruiterJobPost])
    def recruiter_job_post(self, request):
        queryset = JobPost.objects.filter(recruiter=request.user, active=True)
        queryset = self.filter_job_posts(queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ApplicationViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView):
    serializer_class = ApplicationSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        # Lọc danh sách đơn ứng tuyển dựa trên role của user
        user = self.request.user  # lấy thông tin user hiện tại
        if user.role == "candidate":
            return Application.objects.filter(applicant=user, active=True)
        elif self.action in ["accept_application", "reject_application"]:
            return Application.objects.filter(job__recruiter=user, active=True)
        return Application.objects.none()  # Trả về rỗng nếu role không phải là "candidate"

    def get_permissions(self):
        if self.action in ["list_for_recruiter", "accept_application", "reject_application"]:
            return [perms.IsRecruiterApplication()]
        if self.request.method in ['GET', 'POST', 'PUT', 'PATCH']:
            return [perms.IsCandidate()]
        return [perms.ApplicationPerms()]

    @action(detail=False, methods=["get"], url_path="recruiter")
    def list_for_recruiter(self, request):
        # Nhà tuyển dụng xem danh sách đơn ứng tuyển vào job của họ
        queryset = Application.objects.filter(job__recruiter=request.user, active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="accept")
    def accept_application(self, request, pk=None):
        # Nhà tuyển dụng chấp nhận đơn ứng tuyển
        application = self.get_object()
        application.status = "accepted"
        application.save()
        return Response({"message": "Đơn ứng tuyển đã được chấp nhận."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="reject")
    def reject_application(self, request, pk=None):
        # Nhà tuyển dụng từ chối đơn ứng tuyển
        application = self.get_object()
        application.status = "rejected"
        application.save()
        return Response({"message": "Đơn ứng tuyển đã bị từ chối."}, status=status.HTTP_200_OK)

class FollowViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.DestroyAPIView):
    serializer_class = FollowSerializer

    def get_queryset(self):
        # Ứng viên chỉ xem danh sách những nhà tuyển dụng mình đang theo dõi
        return Follow.objects.filter(follower=self.request.user)

    def get_permissions(self):
        if self.action in ["my_followers"]:
            return [perms.IsRecruiterJobPost()]
        if self.request.method in ['GET', 'POST', 'DELETE']:
            return [perms.IsCandidate()]  # Chỉ ứng viên mới có thể follow
        return [permissions.AllowAny()]

    def destroy(self, request, *args, **kwargs):
        # Ứng viên có thể bỏ theo dõi nhà tuyển dụng
        instance = self.get_object()
        instance.delete()
        return Response({"detail": "Đã hủy theo dõi"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["GET"], url_path="recruiter-followers")
    def my_followers(self, request):
        # Nhà tuyển dụng xem danh sách ứng viên follow mình
        followers = Follow.objects.filter(recruiter=request.user)
        data = CandidateSerializer([follow.follower for follow in followers], many=True).data
        return Response(data, status=status.HTTP_200_OK)

class CandidateReviewRecruiterViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.DestroyAPIView):
    queryset = Review.objects.filter(active=True)
    serializer_class = CandidateReviewRecruiterSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [perms.CanCandidateReview()]
        if self.request.method == 'DELETE':
            return [perms.DeleteReview()]
        # GET request: Bất kỳ ai đã đăng nhập đều có thể xem
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], url_path='company/(?P<company_id>\d+)/candidate-reviews')
    def get_reviews_for_company(self, request, company_id=None):
        # Lấy nhà tuyển dụng từ công ty
        company = get_object_or_404(Company, id=company_id)
        recruiter = company.user  # Nhà tuyển dụng là user của công ty đó

        # Lọc các review mà ứng viên đã viết về nhà tuyển dụng này
        queryset = Review.objects.filter(reviewed_user=recruiter, reviewer__role='candidate', active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class RecruiterReviewCandidateViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.DestroyAPIView):
    queryset = Review.objects.filter(active=True)
    serializer_class = RecruiterReviewCandidateSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [perms.CanRecruiterReview()]
        if self.request.method == 'DELETE':
            return [perms.DeleteReview()]
        # GET request: Bất kỳ ai đã đăng nhập đều có thể xem
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], url_path='candidate/(?P<candidate_id>\d+)/recruiter-reviews')
    def get_reviews_for_candidate(self, request, candidate_id=None):
        # Lấy danh sách đánh giá mà nhà tuyển dụng đã viết về một ứng viên cụ thể.
        candidate = get_object_or_404(User, id=candidate_id, role='candidate')
        queryset = Review.objects.filter(reviewed_user=candidate, reviewer__role='recruiter')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
