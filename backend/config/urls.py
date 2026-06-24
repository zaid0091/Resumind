from django.contrib import admin
from django.urls import include, path

from resumes import views as resume_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/health/", resume_views.health_check, name="health-check"),
    path("api/", include("resumes.urls")),
]
