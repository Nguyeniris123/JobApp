from django.contrib import admin
from jobs.models import User, Company, CompanyImage, JobPost, Application, Follow, Review, VerificationDocument
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from django.utils import timezone
from datetime import timedelta, datetime

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

admin_site = MyAdminSite(name='admin')

admin_site.register(User)
admin_site.register(Company)
admin_site.register(CompanyImage)
admin_site.register(JobPost)
admin_site.register(Application)
admin_site.register(Review)
admin_site.register(Follow)
admin_site.register(VerificationDocument)