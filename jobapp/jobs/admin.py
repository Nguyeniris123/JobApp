from django.contrib import admin
from jobs.models import (User, Company, CompanyImage, JobPost, Application, Follow, Review, VerificationDocument)
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path

class MyAdminSite(admin.AdminSite):
    site_header = 'Jops App'

    # http://127.0.0.1:8000/admin/jobs-stats/
    def get_urls(self):
        return [
            path('jobs-stats/', self.stats_view)
        ] + super().get_urls()

    def stats_view(self, request):
        return TemplateResponse(request, 'admin/stats_view.html')

admin_site = MyAdminSite(name='admin')


admin_site.register(User)
admin_site.register(Company)
admin_site.register(CompanyImage)
admin_site.register(JobPost)
admin_site.register(Application)
admin_site.register(Review)
admin_site.register(Follow)
admin_site.register(VerificationDocument)
