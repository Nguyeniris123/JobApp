from django.contrib import admin
from jobs.models import (User, Company, JobPost, Application, Review, FollowCompany, VerificationDocument)
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path

class MyAdminSite(admin.AdminSite):
    site_header = 'Stats Jops App'

    def get_urls(self):
        return [
            path('jobs-stats/', self.stats_view)
        ] + super().get_urls()

    def stats_view(self, request):
        return TemplateResponse(request, 'admin/stats_view.html')

admin_site = MyAdminSite(name='admin')


admin.site.register(User)
admin.site.register(Company)
admin.site.register(JobPost)
admin.site.register(Application)
admin.site.register(Review)
admin.site.register(FollowCompany)
admin.site.register(VerificationDocument)