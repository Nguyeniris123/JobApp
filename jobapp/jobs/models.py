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


class Company(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company')
    name = models.CharField(max_length=255)
    tax_code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    location = models.CharField(max_length=255)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class CompanyImage(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='images')
    image = CloudinaryField(null=True)

    def __str__(self):
        return f"Image of {self.company.name}"


class JobPost(BaseModel):
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_posts')
    title = models.CharField(max_length=255)
    specialized = models.CharField(max_length=100, default="Chưa phân loại")
    description = models.TextField()
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    working_hours = models.CharField(max_length=50)
    location = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class Application(BaseModel):
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="applications")
    cv = CloudinaryField(null=True)
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Đang chờ duyệt"), ("accepted", "Đã chấp nhận"), ("rejected", "Đã từ chối")],
        default="pending"
    )

    class Meta:
        unique_together = ("applicant", "job")  # Ngăn ứng viên ứng tuyển nhiều lần vào 1 công việc

    def __str__(self):
        return f"{self.applicant.username} - {self.job.title} - {self.status}"

class Follow(BaseModel):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")  # Người theo dõi
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")  # Nhà tuyển dụng được theo dõi

    class Meta:
        unique_together = ('follower', 'recruiter')  # Một ứng viên chỉ follow một recruiter một lần

    def __str__(self):
        return f"{self.follower} follows {self.recruiter}"


class Review(BaseModel):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="given_reviews")
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_reviews")
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()

    def __str__(self):
        return f"{self.reviewer.username} đánh giá {self.reviewed_user.username}"


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