import logging
import time
import uuid

from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django_ratelimit.core import is_ratelimited
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from . import ai_service, pdf_service
from .models import (
    Certification,
    Education,
    Experience,
    PersonalInfo,
    Project,
    Resume,
    Skill,
    Summary,
)
from .serializers import (
    CertificationSerializer,
    EducationSerializer,
    ExperienceSerializer,
    ProjectSerializer,
    PublicResumeSerializer,
    ResumeDetailSerializer,
    ResumeListSerializer,
    SkillSerializer,
)

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([])
def health_check(request):
    return JsonResponse({"status": "ok", "timestamp": timezone.now().isoformat()})


class ResumePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class ResumeViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = ResumePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-updated_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return ResumeListSerializer
        return ResumeDetailSerializer

    def get_queryset(self):
        qs = Resume.objects.filter(user=self.request.user)
        template = self.request.query_params.get("template")
        if template:
            qs = qs.filter(template=template)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def _ratelimit_response(self):
        was_limited = is_ratelimited(
            request=self.request,
            group="resumes.ResumeViewSet",
            key="user",
            rate="20/h",
            increment=True,
        )
        self.request.limited = was_limited
        if was_limited:
            return Response(
                {"error": "Rate limit reached. Try again in 60 minutes.", "code": "RATE_LIMITED", "details": {}},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        return None

    def _log_ai_call(self, action_name, resume_id, duration):
        user_id = self.request.user.id
        logger.info(
            "AI_CALL user=%s action=%s resume=%s duration=%.2fs",
            user_id, action_name, resume_id, duration,
        )

    @action(detail=True, methods=["post"])
    def enhance_summary(self, request, pk=None):
        rl = self._ratelimit_response()
        if rl:
            return rl
        resume = self.get_object()
        _start = time.time()
        raw_text = request.data.get("raw_text")
        job_title = request.data.get("job_title", "")

        if not raw_text:
            return Response(
                {"detail": "raw_text is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            enhanced = ai_service.enhance_summary(raw_text, job_title)
        except ai_service.AIServiceException as e:
            logger.error("AI enhance_summary failed for resume %s: %s", resume.id, e)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        summary, created = Summary.objects.update_or_create(
            resume=resume,
            defaults={
                "raw_text": raw_text,
                "ai_enhanced_text": enhanced,
                "use_ai_version": True,
            },
        )

        self._log_ai_call("enhance_summary", resume.id, time.time() - _start)
        return Response({"enhanced_text": enhanced, "original_text": raw_text})

    @action(detail=True, methods=["post"])
    def enhance_experience(self, request, pk=None):
        rl = self._ratelimit_response()
        if rl:
            return rl
        resume = self.get_object()
        _start = time.time()
        experience_id = request.data.get("experience_id")

        if not experience_id:
            return Response(
                {"detail": "experience_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exp = resume.experiences.get(id=experience_id)
        except Experience.DoesNotExist:
            return Response(
                {"detail": "Experience not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            enhanced = ai_service.enhance_experience(
                exp.raw_description, exp.job_title, exp.company
            )
        except ai_service.AIServiceException as e:
            logger.error("AI enhance_experience failed for experience %s: %s", experience_id, e)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        exp.ai_enhanced_description = enhanced
        exp.use_ai_version = True
        exp.save(update_fields=["ai_enhanced_description", "use_ai_version"])

        self._log_ai_call("enhance_experience", resume.id, time.time() - _start)
        return Response({"enhanced_text": enhanced, "experience_id": int(experience_id)})

    @action(detail=True, methods=["post"])
    def enhance_project(self, request, pk=None):
        rl = self._ratelimit_response()
        if rl:
            return rl
        resume = self.get_object()
        _start = time.time()
        project_id = request.data.get("project_id")

        if not project_id:
            return Response(
                {"detail": "project_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            proj = resume.projects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            enhanced = ai_service.enhance_project(
                proj.title, proj.description, proj.tech_stack
            )
        except ai_service.AIServiceException as e:
            logger.error("AI enhance_project failed for project %s: %s", project_id, e)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        proj.ai_enhanced_description = enhanced
        proj.save(update_fields=["ai_enhanced_description"])

        self._log_ai_call("enhance_project", resume.id, time.time() - _start)
        return Response({"enhanced_text": enhanced, "project_id": int(project_id)})

    @action(detail=True, methods=["post"])
    def enhance_all(self, request, pk=None):
        rl = self._ratelimit_response()
        if rl:
            return rl
        resume = self.get_object()
        _start = time.time()

        try:
            counts = ai_service.enhance_all(resume)
        except ai_service.AIServiceException as e:
            logger.error("AI enhance_all failed for resume %s: %s", resume.id, e)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        self._log_ai_call("enhance_all", resume.id, time.time() - _start)
        return Response(counts)

    @action(detail=True, methods=["get"])
    def export_pdf(self, request, pk=None):
        resume = self.get_object()

        html_string = pdf_service.generate_preview_html(
            resume,
            color_theme=request.query_params.get("color_theme"),
            font_size=request.query_params.get("font_size"),
            hidden_sections=(
                request.query_params.get("hidden_sections", "").split(",")
                if request.query_params.get("hidden_sections")
                else []
            ),
        )

        safe_title = resume.title.replace(" ", "_")
        response = HttpResponse(html_string, content_type="text/html")
        response["Content-Disposition"] = (
            f'inline; filename="resume_{safe_title}.html"'
        )
        return response

    @action(detail=True, methods=["get"])
    def preview(self, request, pk=None):
        resume = self.get_object()
        try:
            html = pdf_service.generate_preview_html(
                resume,
                color_theme=request.query_params.get("color_theme"),
                font_size=request.query_params.get("font_size"),
                hidden_sections=(
                    request.query_params.get("hidden_sections", "").split(",")
                    if request.query_params.get("hidden_sections")
                    else []
                ),
            )
            return HttpResponse(html, content_type="text/html; charset=utf-8")
        except Exception as e:
            logger.error("Preview generation failed for resume %s: %s", resume.id, e)
            return Response(
                {"detail": f"Preview generation failed: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["get"])
    def tips(self, request, pk=None):
        resume = self.get_object()

        resume_data = {
            "title": resume.title,
            "template": resume.template,
            "personal_info": self._serialize_related(resume, "personal_info"),
            "summary": self._serialize_related(resume, "summary"),
            "experiences": list(
                resume.experiences.values("job_title", "company", "raw_description")
            ),
            "education": list(
                resume.education.values("degree", "institution", "start_year", "end_year", "gpa")
            ),
            "skills": list(resume.skills.values("name", "category", "proficiency")),
            "projects": list(
                resume.projects.values("title", "description", "tech_stack")
            ),
            "certifications": list(resume.certifications.values("name", "issuer")),
        }

        try:
            tips = ai_service.generate_tips(resume_data)
        except ai_service.AIServiceException as e:
            logger.error("AI tips failed for resume %s: %s", resume.id, e)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"tips": tips})

    @action(detail=True, methods=["post"])
    def duplicate(self, request, pk=None):
        original = self.get_object()
        new_resume = Resume.objects.create(
            user=request.user,
            title=f"{original.title} (Copy)",
            template=original.template,
        )

        # Duplicate personal info
        try:
            pi = original.personal_info
            PersonalInfo.objects.create(
                resume=new_resume,
                full_name=pi.full_name,
                email=pi.email,
                phone=pi.phone,
                location=pi.location,
                linkedin=pi.linkedin,
                github=pi.github,
                portfolio=pi.portfolio,
            )
        except Exception:
            pass

        # Duplicate summary
        try:
            s = original.summary
            Summary.objects.create(
                resume=new_resume,
                raw_text=s.raw_text,
                ai_enhanced_text=s.ai_enhanced_text,
                use_ai_version=s.use_ai_version,
            )
        except Exception:
            pass

        # Duplicate experiences
        for exp in original.experiences.all():
            Experience.objects.create(
                resume=new_resume,
                job_title=exp.job_title,
                company=exp.company,
                location=exp.location,
                start_date=exp.start_date,
                end_date=exp.end_date,
                is_current=exp.is_current,
                raw_description=exp.raw_description,
                ai_enhanced_description=exp.ai_enhanced_description,
                use_ai_version=exp.use_ai_version,
                order=exp.order,
            )

        # Duplicate education
        for edu in original.education.all():
            Education.objects.create(
                resume=new_resume,
                degree=edu.degree,
                institution=edu.institution,
                location=edu.location,
                start_year=edu.start_year,
                end_year=edu.end_year,
                gpa=edu.gpa,
                honors=edu.honors,
                order=edu.order,
            )

        # Duplicate skills
        for skill in original.skills.all():
            Skill.objects.create(
                resume=new_resume,
                name=skill.name,
                category=skill.category,
                proficiency=skill.proficiency,
            )

        # Duplicate projects
        for proj in original.projects.all():
            Project.objects.create(
                resume=new_resume,
                title=proj.title,
                description=proj.description,
                ai_enhanced_description=proj.ai_enhanced_description,
                tech_stack=proj.tech_stack,
                url=proj.url,
                order=proj.order,
            )

        # Duplicate certifications
        for cert in original.certifications.all():
            Certification.objects.create(
                resume=new_resume,
                name=cert.name,
                issuer=cert.issuer,
                issue_date=cert.issue_date,
                expiry_date=cert.expiry_date,
                credential_url=cert.credential_url,
            )

        serializer = ResumeDetailSerializer(new_resume, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def toggle_public(self, request, pk=None):
        resume = self.get_object()
        resume.is_public = not resume.is_public
        if resume.is_public and not resume.public_slug:
            resume.public_slug = str(uuid.uuid4())
        resume.save(update_fields=["is_public", "public_slug"])
        return Response(
            {"is_public": resume.is_public, "public_slug": resume.public_slug}
        )

    @action(detail=True, methods=["post"])
    def ats_score(self, request, pk=None):
        resume = self.get_object()
        job_description = request.data.get("job_description")

        if not job_description:
            return Response(
                {"detail": "job_description is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resume_data = {
            "title": resume.title,
            "summary": (
                {
                    "text": (
                        resume.summary.ai_enhanced_text
                        if resume.summary.use_ai_version
                        else resume.summary.raw_text
                    )
                }
                if hasattr(resume, "summary") and resume.summary
                else {}
            ),
            "skills": list(resume.skills.values("name", "category")),
            "experiences": list(
                resume.experiences.values("job_title", "company", "raw_description")
            ),
            "education": list(resume.education.values("degree", "institution")),
            "projects": list(resume.projects.values("title", "description", "tech_stack")),
            "certifications": list(resume.certifications.values("name")),
        }

        try:
            result = ai_service.calculate_ats_score(resume_data, job_description)
        except ai_service.AIServiceException as e:
            logger.error("ATS score failed for resume %s: %s", resume.id, e)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(result)

    def _serialize_related(self, resume, field):
        try:
            obj = getattr(resume, field, None)
            if obj is None:
                return None
            return {
                k: str(v) if hasattr(v, "url") else v
                for k, v in obj.__dict__.items()
                if not k.startswith("_")
            }
        except Exception:
            return None


class PublicResumeViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PublicResumeSerializer
    lookup_field = "public_slug"

    def get_queryset(self):
        return Resume.objects.filter(is_public=True)


class ExperienceViewSet(viewsets.ModelViewSet):
    serializer_class = ExperienceSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Experience.objects.filter(resume__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        items = request.data
        if not isinstance(items, list):
            return Response(
                {"detail": "A list of {id, order} objects is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated = 0
        for item in items:
            try:
                exp = Experience.objects.get(id=item["id"], resume__user=request.user)
                exp.order = item["order"]
                exp.save(update_fields=["order"])
                updated += 1
            except (Experience.DoesNotExist, KeyError):
                continue

        return Response({"updated": updated})


class EducationViewSet(viewsets.ModelViewSet):
    serializer_class = EducationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Education.objects.filter(resume__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        items = request.data
        if not isinstance(items, list):
            return Response(
                {"detail": "A list of {id, order} objects is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated = 0
        for item in items:
            try:
                edu = Education.objects.get(id=item["id"], resume__user=request.user)
                edu.order = item["order"]
                edu.save(update_fields=["order"])
                updated += 1
            except (Education.DoesNotExist, KeyError):
                continue

        return Response({"updated": updated})


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Skill.objects.filter(resume__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        items = request.data
        if not isinstance(items, list):
            return Response(
                {"detail": "A list of skill objects is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = SkillSerializer(data=items, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Project.objects.filter(resume__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()


class CertificationViewSet(viewsets.ModelViewSet):
    serializer_class = CertificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Certification.objects.filter(resume__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()
