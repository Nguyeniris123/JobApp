from rest_framework import serializers
from .models import User, Company, CompanyImage


# class CompanySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Company
#         fields = ['name', 'tax_code', 'description', 'location', 'images']


class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'password', 'avatar']
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
    company_name = serializers.CharField(required=True)
    tax_code = serializers.CharField(required=True)
    description = serializers.CharField(required=True)
    location = serializers.CharField(required=True)
    images = serializers.ListField(child=serializers.CharField(), required=True)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'username', 'password', 'avatar',
            'company_name', 'tax_code', 'description', 'location', 'images'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'required': True}
        }

    def create(self, validated_data):
        # Xử lý tách data
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

        # Lưu từng ảnh môi trường làm việc
        for image in images_data:
            CompanyImage.objects.create(company=company, image=image)

        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        if hasattr(instance, 'company'):
            data['company'] = {
                'name': instance.company.name,
                'tax_code': instance.company.tax_code,
                'description': instance.company.description,
                'location': instance.company.location,
                'images': [img.image.url for img in instance.company.images.all()]
            }
        return data
