"""
URL configuration for jobapp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from jobs.admin import admin_site
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# from jobs.firebase_views import FirebaseTokenView

schema_view = get_schema_view(
    openapi.Info(
        title="Jobs APIs",
        default_version='v1',
        description="APIs for JobApp",
        contact=openapi.Contact(email="nhom10@gmail.com"),
        license=openapi.License(name="Nhom 10 @2025"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


#truy cập stats_view bằng http://127.0.0.1:8000/admin/jobs-stats/
urlpatterns = [
    path('', include('jobs.urls')),
    path('admin/', admin_site.urls),
    re_path(r'^ckeditor/', include('ckeditor_uploader.urls')),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0),name='schema-json'),
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0),name = 'schema-swagger-ui'),
    re_path(r'^redoc/$',schema_view.with_ui('redoc', cache_timeout=0),name='schema-redoc'),
    path('o/', include('oauth2_provider.urls',namespace='oauth2_provider')),
    # path('firebase-token/', FirebaseTokenView.as_view(), name='firebase-token'),
]

