from django.contrib.auth import get_user_model
from oauth2_provider.models import AccessToken
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from .models import User, Company, CompanyImage, JobPost, Application


# class CompanySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Company
#         fields = ['name', 'tax_code', 'description', 'location', 'images']

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

User = get_user_model()
class CustomOAuth2TokenSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = AccessToken
        fields = ["token", "expires", "user"]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "username": obj.user.username,
            "email": obj.user.email,
            "role": obj.user.role,
            "avatar": obj.user.avatar.url if obj.user.avatar else "",
        }

class JobPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPost
        fields = ['title', 'specialized', 'description', 'salary', 'working_hours', 'location']

    def create(self, validated_data):
        # Gán recruiter là user hiện tại
        validated_data['recruiter'] = self.context['request'].user
        return super().create(validated_data)

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["job", "cv", "status"]

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        validated_data["applicant"] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user

        if user.role == "candidate":
            if "status" in validated_data:
                raise PermissionDenied("Ứng viên không thể thay đổi trạng thái đơn ứng tuyển!")
            return super().update(instance, validated_data)

        elif user.role == "recruiter":
            if "cv" in validated_data:
                raise PermissionDenied("Nhà tuyển dụng không thể thay đổi CV của ứng viên!")
            return super().update(instance, validated_data)

        raise PermissionDenied("Bạn không có quyền cập nhật đơn ứng tuyển này!")