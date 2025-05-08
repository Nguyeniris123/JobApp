from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from .models import User, Company, CompanyImage, JobPost, Application, Follow, Review


class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'password', 'email', 'avatar']
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'required': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data, role='candidate')
        user.set_password(password)
        user.save()
        return user

    def to_representation(self, instance):
        d = super().to_representation(instance)
        d['avatar'] = instance.avatar.url if instance.avatar else ''
        return d

class RecruiterSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(write_only=True, required=True)
    tax_code = serializers.CharField(write_only=True, required=True)
    description = serializers.CharField(write_only=True, required=True)
    location = serializers.CharField(write_only=True, required=True)
    images = serializers.ListField(child=serializers.CharField(), write_only=True, required=True)

    company = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'username', 'password', 'email', 'avatar',
            'company_name', 'tax_code', 'description', 'location', 'images',
            'company'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'required': True}
        }

    def create(self, validated_data):
        # Lấy và tách các trường liên quan tới Company
        images_data = validated_data.pop('images')
        company_info = {
            'name': validated_data.pop('company_name'),
            'tax_code': validated_data.pop('tax_code'),
            'description': validated_data.pop('description'),
            'location': validated_data.pop('location'),
        }
        password = validated_data.pop('password')

        # Tạo user
        user = User(**validated_data, role='recruiter')
        user.set_password(password)
        user.save()

        # Tạo company
        company = Company.objects.create(user=user, **company_info)

        # # Validate ảnh
        # if len(images_data) < 3:
        #     raise serializers.ValidationError({"images": "Công ty phải có ít nhất 3 ảnh môi trường làm việc."})

        # Lưu từng ảnh
        for image in images_data:
            CompanyImage.objects.create(company=company, image=image)

        return user

    # Get - Lấy thông tin company từ bảng Company
    def get_company(self, obj):
        if hasattr(obj, 'company'):
            return {
                'name': obj.company.name,
                'tax_code': obj.company.tax_code,
                'description': obj.company.description,
                'location': obj.company.location,
                'is_verified': obj.company.is_verified,
                'images': [img.image.url for img in obj.company.images.all()]
            }
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Thêm avatar vào GET
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

class UpdateAvatarSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=True)

    class Meta:
        model = User
        fields = ['avatar']

    def update(self, instance, validated_data):
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.save()
        return instance

class CompanyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyImage
        fields = ['image']  # Chỉ lấy URL ảnh

class CompanySerializer(serializers.ModelSerializer):
    images = CompanyImageSerializer(source='images.all', many=True, read_only=True)  # Lấy danh sách ảnh của công ty

    class Meta:
        model = Company
        fields = ['id', 'name', 'tax_code', 'description', 'location', 'is_verified', 'images']  # Thêm images vào fields

class JobPostSerializer(serializers.ModelSerializer):
    company = CompanySerializer(source='recruiter.company', read_only=True)  # Lấy thông tin công ty từ recruiter
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = ['id', 'title', 'specialized', 'description', 'salary', 'working_hours', 'location', 'recruiter', 'company', 'application_count']
        read_only_fields = ['recruiter']

    def create(self, validated_data):
        validated_data['recruiter'] = self.context['request'].user  # Gán recruiter là user hiện tại
        return super().create(validated_data)

    def get_application_count(self, obj):
        return obj.applications.count()  # Đếm số lượng Application cho JobPost

class ApplicationSerializer(serializers.ModelSerializer):
    job = serializers.PrimaryKeyRelatedField(queryset=JobPost.objects.all(), write_only=True)  # Chỉ nhận job_id khi tạo
    job_detail = JobPostSerializer(source="job", read_only=True)  # Xuất thông tin job đầy đủ khi trả về
    class Meta:
        model = Application

        fields = ['id', "job", "job_detail", "cv", "status"]
        read_only_fields = ["applicant", "status", "created_date", "job_detail"]  # Không cần nhập applicant, status, created_date khi gửi request

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        job = validated_data["job"]

        # Kiểm tra nếu đã ứng tuyển công việc này
        if Application.objects.filter(applicant=user, job=job).exists():
            raise serializers.ValidationError("Bạn đã ứng tuyển công việc này rồi!")

        validated_data["applicant"] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user

        # Chặn thay đổi job_id cho cả ứng viên và nhà tuyển dụng
        if "job" in validated_data and instance.job.id != validated_data["job"].id:
            raise PermissionDenied("Không thể thay đổi công việc đã ứng tuyển!")

        if user.role == "candidate":
            if "status" in validated_data:
                raise PermissionDenied("Ứng viên không thể thay đổi trạng thái đơn ứng tuyển!")
            return super().update(instance, {"cv": validated_data.get("cv", instance.cv)})  # Chỉ cập nhật CV
        raise PermissionDenied("Bạn không có quyền cập nhật đơn ứng tuyển này!")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.cv:
            data['cv'] = instance.cv.url  # chỉ lấy đúng URL, bỏ prefix thừa
        return data

class FollowSerializer(serializers.ModelSerializer):
    recruiter_company = CompanySerializer(source="recruiter.company", read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), write_only=True
    )

    class Meta:
        model = Follow
        fields = ["id", "company_id", "follower", "recruiter", "recruiter_company", "created_date"]
        read_only_fields = ["follower", "recruiter", "recruiter_company", "created_date"]

    def validate(self, attrs):
        request = self.context["request"]
        company = attrs["company_id"]

        recruiter = company.user  # Mỗi công ty có 1 recruiter (user) duy nhất
        if recruiter == request.user:
            raise serializers.ValidationError("Bạn không thể tự theo dõi chính mình.")

        if recruiter.role != "recruiter":
            raise serializers.ValidationError("Công ty này không phải do nhà tuyển dụng quản lý!")

        attrs["recruiter"] = recruiter
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["follower"] = request.user
        validated_data.pop("company_id")  # Không phải trường trong model Follow

        if Follow.objects.filter(follower=request.user, recruiter=validated_data["recruiter"]).exists():
            raise serializers.ValidationError({"detail": "Bạn đã theo dõi công ty này rồi!"})

        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'avatar']

class CandidateReviewRecruiterSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)  # Trả về thông tin người đánh giá
    reviewed_user = UserSerializer(read_only=True)  # Trả về thông tin người được đánh giá (nhà tuyển dụng)
    company_id = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all(), write_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'reviewed_user', 'rating', 'comment', 'created_date', 'company_id']
        read_only_fields = ['reviewer', 'reviewed_user', 'created_date']

    def validate(self, attrs):
        request = self.context["request"]
        company = attrs["company_id"]  # Nhận company_id từ dữ liệu gửi lên

        # Lấy nhà tuyển dụng (recruiter) từ công ty
        recruiter = company.user  # Mỗi công ty chỉ có một nhà tuyển dụng (user)

        # Kiểm tra nếu người đánh giá (reviewer) đang cố gắng đánh giá chính công ty của mình
        if recruiter == request.user:
            raise serializers.ValidationError("Bạn không thể tự đánh giá công ty của mình.")

        # Kiểm tra rằng người đánh giá phải là ứng viên (candidate)
        if request.user.role != "candidate":
            raise serializers.ValidationError("Chỉ ứng viên mới có thể đánh giá nhà tuyển dụng.")

        # Gán nhà tuyển dụng là người được đánh giá
        attrs["reviewed_user"] = recruiter
        return attrs

    def create(self, validated_data):
        # Gán người đánh giá từ request.user
        validated_data["reviewer"] = self.context["request"].user
        validated_data.pop("company_id")  # Không phải trường trong model Review
        return super().create(validated_data)

class RecruiterReviewCandidateSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewed_user = UserSerializer(read_only=True)
    candidate_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='candidate'), write_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'reviewed_user', 'rating', 'comment', 'created_date', 'candidate_id']
        read_only_fields = ['reviewer', 'reviewed_user', 'created_date']

    def validate(self, attrs):
        request = self.context["request"]
        candidate = attrs["candidate_id"]

        # Đảm bảo người dùng hiện tại là nhà tuyển dụng
        if request.user.role != "recruiter":
            raise serializers.ValidationError("Chỉ nhà tuyển dụng mới có thể đánh giá ứng viên.")

        # Không được tự đánh giá chính mình
        if candidate == request.user:
            raise serializers.ValidationError("Bạn không thể tự đánh giá chính mình.")

        # Gán người được đánh giá
        attrs["reviewed_user"] = candidate
        return attrs

    def create(self, validated_data):
        validated_data["reviewer"] = self.context["request"].user
        validated_data.pop("candidate_id")
        return super().create(validated_data)


