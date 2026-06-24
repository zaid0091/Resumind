from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("resumes", views.ResumeViewSet, basename="resume")
router.register("experiences", views.ExperienceViewSet, basename="experience")
router.register("education", views.EducationViewSet, basename="education")
router.register("skills", views.SkillViewSet, basename="skill")
router.register("projects", views.ProjectViewSet, basename="project")
router.register("certifications", views.CertificationViewSet, basename="certification")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "public/<slug:pk>/",
        views.PublicResumeViewSet.as_view({"get": "retrieve"}),
        name="public-resume",
    ),
]
