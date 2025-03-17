from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres import serializers
from django.db import models
from django.contrib.auth import get_user_model


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Quản trị viên'),
        ('recruiter', 'Nhà tuyển dụng'),
        ('candidate', 'Ứng viên'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
class Company(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    tax_code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    location = models.CharField(max_length=255)
    images = models.JSONField(default=list)  # Lưu danh sách ảnh môi trường làm việc
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name
class JobPost(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    working_hours = models.CharField(max_length=50)
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
class Application(models.Model):
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE)
    candidate = models.ForeignKey(User, on_delete=models.CASCADE)
    cv = models.FileField(upload_to='cvs/')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Chờ duyệt'),
        ('accepted', 'Đã chấp nhận'),
        ('rejected', 'Đã từ chối')
    ], default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.candidate.username} - {self.job.title}"
class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="given_reviews")
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_reviews")
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review from {self.reviewer.username} to {self.reviewee.username}"
class Follow(models.Model):
    candidate = models.ForeignKey(User, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    followed_at = models.DateTimeField(auto_now_add=True)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'avatar']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class JobPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPost
        fields = '__all__'
        read_only_fields = ['company']  # Công ty được tự động gán từ user đăng nhập

User = get_user_model()

class Application(models.Model):
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="applications")
    cv = models.FileField(upload_to="cv/")
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Đang chờ duyệt"), ("accepted", "Đã chấp nhận"), ("rejected", "Đã từ chối")],
        default="pending"
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.applicant.username} - {self.job.title}"

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['applicant', 'status']

User = get_user_model()

class FollowCompany(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follows")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="followers")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} follows {self.company.name}"

class FollowCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowCompany
        fields = '__all__'
        read_only_fields = ['user']

User = get_user_model()

class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="given_reviews")
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_reviews")
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reviewer.username} đánh giá {self.reviewed_user.username}"

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['reviewer']

User = get_user_model()

class VerificationStatus(models.TextChoices):
    PENDING = "pending", "Chờ duyệt"
    APPROVED = "approved", "Đã duyệt"
    REJECTED = "rejected", "Bị từ chối"

class VerificationDocument(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    document = models.FileField(upload_to="verification_documents/")
    status = models.CharField(
        max_length=10, choices=VerificationStatus.choices, default=VerificationStatus.PENDING
    )
    admin_note = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Verification for {self.user.username} - {self.status}"

class VerificationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationDocument
        fields = ["id", "user", "document", "status", "admin_note", "submitted_at", "reviewed_at"]
        read_only_fields = ["user", "status", "submitted_at", "reviewed_at"]