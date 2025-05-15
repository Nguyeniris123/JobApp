from django.contrib import admin
from jobs.models import User, Company, CompanyImage, JobPost, Application, Follow, Review, VerificationDocument
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from django.utils import timezone
from datetime import timedelta, datetime
from django.utils.html import mark_safe

class MyAdminSite(admin.AdminSite):
    site_header = 'Jops App'

    def get_urls(self):
        return [
            path('jobs-stats/', self.stats_view, name='jobs-stats')
        ] + super().get_urls()

    def stats_view(self, request):
        # Lấy khoảng thời gian từ query params (nếu có)
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')

        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
                end_date = end_date.replace(hour=23, minute=59, second=59)  # Bao gồm cả ngày cuối
            except ValueError:
                start_date = timezone.now() - timedelta(days=365)
                end_date = timezone.now()
        else:
            end_date = timezone.now()
            start_date = end_date - timedelta(days=365)

        # Thống kê JobPost theo tháng
        job_stats = (
            JobPost.objects.filter(created_date__range=[start_date, end_date])
            .extra(select={'month': "EXTRACT(month FROM created_date)", 'year': "EXTRACT(year FROM created_date)"})
            .values('year', 'month')
            .annotate(count=Count('id'))
            .order_by('year', 'month')
        )

        # Thống kê Recruiter
        recruiter_stats = (
            User.objects.filter(role='recruiter', date_joined__range=[start_date, end_date])
            .extra(select={'month': "EXTRACT(month FROM date_joined)", 'year': "EXTRACT(year FROM date_joined)"})
            .values('year', 'month')
            .annotate(count=Count('id'))
            .order_by('year', 'month')
        )

        # Thống kê Candidate
        candidate_stats = (
            User.objects.filter(role='candidate', date_joined__range=[start_date, end_date])
            .extra(select={'month': "EXTRACT(month FROM date_joined)", 'year': "EXTRACT(year FROM date_joined)"})
            .values('year', 'month')
            .annotate(count=Count('id'))
            .order_by('year', 'month')
        )

        # Chuẩn bị dữ liệu cho Chart.js
        labels = [f"{int(entry['year'])}-{int(entry['month'])}" for entry in job_stats]
        job_data = [entry['count'] for entry in job_stats]
        recruiter_data = [entry['count'] for entry in recruiter_stats]
        candidate_data = [entry['count'] for entry in candidate_stats]

        context = {
            'labels': labels,
            'job_data': job_data,
            'recruiter_data': recruiter_data,
            'candidate_data': candidate_data,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
        }

        return TemplateResponse(request, 'admin/stats_view.html', context)

class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'is_staff', 'is_active', 'date_joined', 'avatar']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering = ['-date_joined']
    readonly_fields = ['avatar_display']

    def avatar_display(self, obj):
        if obj.avatar:
            return mark_safe(f"<img src='{obj.avatar.url}' width='120' />")


class CompanyImageInlineAdmin(admin.StackedInline):
    model = CompanyImage
    fk_name = 'company'
    readonly_fields = ['image_preview']  # Dùng để hiển thị ảnh

    fields = ['image', 'image_preview']  # Sắp xếp field hiển thị
    extra = 0

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f"<img src='{obj.image.url}' width='120' />")
        return "(No image)"

class CompanyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'tax_code', 'location', 'is_verified', 'user', 'created_date', 'updated_date']
    list_filter = ['is_verified']
    search_fields = ['name', 'tax_code', 'location', 'description', 'user__username', 'user__email']
    ordering = ['name']
    inlines = [CompanyImageInlineAdmin, ]

class CompanyImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'company', 'image', 'created_date', 'updated_date']
    list_filter = ['company']
    search_fields = ['company__name']
    ordering = ['-created_date']
    readonly_fields = ['image_display']

    def image_display(self, obj):
        if obj.image:
            return mark_safe(f"<img src='{obj.image.url}' width='120' />")

class JobPostAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'specialized', 'salary', 'working_hours', 'location', 'recruiter', 'created_date', 'updated_date']
    list_filter = ['specialized', 'location', 'recruiter']
    search_fields = ['title', 'description', 'specialized', 'location', 'recruiter__username', 'recruiter__email']
    ordering = ['-created_date']

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['id', 'applicant', 'job', 'cv', 'status', 'created_date', 'updated_date']
    list_filter = ['status', 'job', 'applicant']
    search_fields = ['applicant__username', 'applicant__first_name', 'applicant__last_name', 'job__title']
    ordering = ['-created_date']

class FollowAdmin(admin.ModelAdmin):
    list_display = ['id', 'follower', 'recruiter', 'created_date', 'updated_date']
    list_filter = ['follower', 'recruiter']
    search_fields = ['follower__username', 'recruiter__username']
    ordering = ['-created_date']

class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'reviewer', 'reviewed_user', 'rating', 'comment', 'created_date', 'updated_date']
    list_filter = ['rating', 'reviewer', 'reviewed_user']
    search_fields = ['reviewer__username', 'reviewed_user__username', 'comment']
    ordering = ['-created_date']

class VerificationDocumentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'document', 'status', 'created_date', 'updated_date', 'admin_note']
    list_filter = ['status', 'user']
    search_fields = ['user__username']
    ordering = ['-created_date']

admin_site = MyAdminSite(name='admin')

admin_site.register(User, UserAdmin)
admin_site.register(Company, CompanyAdmin)
admin_site.register(CompanyImage, CompanyImageAdmin)
admin_site.register(JobPost, JobPostAdmin)
admin_site.register(Application, ApplicationAdmin)
admin_site.register(Review, ReviewAdmin)
admin_site.register(Follow,FollowAdmin)
admin_site.register(VerificationDocument)