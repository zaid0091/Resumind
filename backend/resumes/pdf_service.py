from django.template.loader import render_to_string


def generate_preview_html(resume, color_theme=None, font_size=None, hidden_sections=None) -> str:
    template_name = f"resumes/{resume.template}.html"
    context = _build_context(resume)
    context.update({
        "color_theme": color_theme or "#2563EB",
        "font_size": font_size or "medium",
        "hidden_sections": hidden_sections or [],
    })
    return render_to_string(template_name, context)


def _build_context(resume):
    pi = getattr(resume, "personal_info", None) if hasattr(resume, "personal_info") else None
    summary = getattr(resume, "summary", None) if hasattr(resume, "summary") else None
    experiences = resume.experiences.all() if resume.pk else []
    education = resume.education.all() if resume.pk else []
    skills = resume.skills.all() if resume.pk else []
    projects = resume.projects.all() if resume.pk else []
    certifications = resume.certifications.all() if resume.pk else []
    return {
        "resume": resume,
        "personal_info": pi,
        "summary": summary,
        "experiences": experiences,
        "education": education,
        "skills": skills,
        "projects": projects,
        "certifications": certifications,
    }
