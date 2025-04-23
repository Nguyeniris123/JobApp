from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import JobPost, Follow
import os

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
