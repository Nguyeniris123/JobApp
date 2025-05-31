from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import JobPost, Follow, CompanyImage
import os

from .verify_image import verify_image_with_google_vision


@receiver(post_save, sender=JobPost)
def notify_followers_on_job_create(sender, instance, created, **kwargs):
    if created:
        recruiter = instance.recruiter
        followers = Follow.objects.filter(recruiter=recruiter).select_related("follower")

        subject = f"[{recruiter.username}] vừa đăng tin tuyển dụng mới!"
        message = (
            f"Tin tuyển dụng mới: {instance.title}\n"
            f"Ngành nghề: {instance.specialized}\n"           
            f"Mức lương: {instance.salary}\n"
            f"Địa điểm: {instance.location}\n\n"
            f"Đăng bởi: {recruiter.username}"
        )

        recipient_list = [f.follower.email for f in followers if f.follower.email]

        if recipient_list:
            send_mail(
                subject=subject,
                message=message,
                from_email=os.getenv("EMAIL_SEND"),
                recipient_list=recipient_list,
                fail_silently=True
            )

@receiver(post_save, sender=CompanyImage)
def auto_verify_company_image(sender, instance, created, **kwargs):
    if created:
        # Gọi Vision API kiểm tra ảnh
        result = verify_image_with_google_vision(instance.image.url)

        print(f"🧠 Ảnh upload từ {instance.image.url}")
        print(f"✅ Kết quả xác minh: {result['is_real']} - {result['reason']}")

        # Nếu ảnh được xác minh là thật → cập nhật công ty
        if result['is_real'] and not instance.company.is_verified:
            instance.company.is_verified = True
            instance.company.save()