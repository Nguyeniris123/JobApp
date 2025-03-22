from cloudinary.models import CloudinaryField
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres import serializers
from django.db import models
from django.contrib.auth import get_user_model


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-id']


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Quản trị viên'),
        ('recruiter', 'Nhà tuyển dụng'),
        ('candidate', 'Ứng viên'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    # avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    avatar = CloudinaryField(null=True)

    def __str__(self):
        return self.username


class Company(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    tax_code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    location = models.CharField(max_length=255)
    images = models.JSONField(default=list)  # Lưu danh sách ảnh môi trường làm việc
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class JobPost(BaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    Specialized = models.CharField(max_length=100, default="Chưa phân loại")
    description = models.TextField()
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    working_hours = models.CharField(max_length=50)
    location = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class Application(BaseModel):
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="applications")
    cv = models.FileField(upload_to="cv/")
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Đang chờ duyệt"), ("accepted", "Đã chấp nhận"), ("rejected", "Đã từ chối")],
        default="pending"
    )

    def __str__(self):
        return f"{self.applicant.username} - {self.job.title}"


class Review(BaseModel):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="given_reviews")
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_reviews")
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()

    def __str__(self):
        return f"{self.reviewer.username} đánh giá {self.reviewed_user.username}"


class FollowCompany(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follows")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="followers")

    def __str__(self):
        return f"{self.user.username} follows {self.company.name}"


class VerificationStatus(models.TextChoices):
    PENDING = "pending", "Chờ duyệt"
    APPROVED = "approved", "Đã duyệt"
    REJECTED = "rejected", "Bị từ chối"


class VerificationDocument(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    document = models.FileField(upload_to="verification_documents/")
    status = models.CharField(
        max_length=10, choices=VerificationStatus.choices, default=VerificationStatus.PENDING
    )
    admin_note = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Verification for {self.user.username} - {self.status}"