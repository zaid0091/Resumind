import uuid

from django.contrib.auth.models import User
from django.db import models


class Resume(models.Model):
    TEMPLATE_CHOICES = [
        ("modern", "Modern"),
        ("classic", "Classic"),
        ("minimal", "Minimal"),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="resumes"
    )
    title = models.CharField(max_length=100, default="Untitled Resume")
    template = models.CharField(
        max_length=20, choices=TEMPLATE_CHOICES, default="modern"
    )
    is_ai_enhanced = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    public_slug = models.CharField(
        max_length=36, unique=True, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at",)

    def __str__(self):
        return f"{self.title} — {self.user.username}"

    def generate_public_slug(self):
        if not self.public_slug:
            self.public_slug = str(uuid.uuid4())
            self.save(update_fields=["public_slug"])

    @property
    def completion_percentage(self):
        sections = [
            hasattr(self, "personal_info") and bool(self.personal_info.full_name),
            hasattr(self, "summary") and bool(self.summary.raw_text),
            self.experiences.exists(),
            self.education.exists(),
            self.skills.exists(),
            self.projects.exists(),
            self.certifications.exists(),
        ]
        completed = sum(1 for s in sections if s)
        return int((completed / len(sections)) * 100)


class PersonalInfo(models.Model):
    resume = models.OneToOneField(
        Resume, on_delete=models.CASCADE, related_name="personal_info"
    )
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=100, blank=True, default="")
    linkedin = models.CharField(max_length=200, blank=True, default="")
    github = models.CharField(max_length=200, blank=True, default="")
    portfolio = models.CharField(max_length=200, blank=True, default="")
    profile_photo = models.ImageField(
        upload_to="photos/", blank=True, null=True
    )

    def __str__(self):
        return self.full_name


class Summary(models.Model):
    resume = models.OneToOneField(
        Resume, on_delete=models.CASCADE, related_name="summary"
    )
    raw_text = models.TextField(blank=True, default="")
    ai_enhanced_text = models.TextField(blank=True)
    use_ai_version = models.BooleanField(default=True)
    target_job_title = models.CharField(max_length=200, blank=True, default="")

    def __str__(self):
        return f"Summary for {self.resume.title}"


class Experience(models.Model):
    resume = models.ForeignKey(
        Resume, on_delete=models.CASCADE, related_name="experiences"
    )
    job_title = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    raw_description = models.TextField()
    ai_enhanced_description = models.TextField(blank=True)
    use_ai_version = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "-start_date")

    def __str__(self):
        return f"{self.job_title} at {self.company}"


class Education(models.Model):
    resume = models.ForeignKey(
        Resume, on_delete=models.CASCADE, related_name="education"
    )
    degree = models.CharField(max_length=100)
    institution = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(null=True, blank=True)
    gpa = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True
    )
    honors = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "-start_year")

    def __str__(self):
        return f"{self.degree} at {self.institution}"


class Skill(models.Model):
    CATEGORY_CHOICES = [
        ("technical", "Technical"),
        ("soft", "Soft"),
        ("language", "Language"),
        ("tool", "Tool"),
    ]

    resume = models.ForeignKey(
        Resume, on_delete=models.CASCADE, related_name="skills"
    )
    name = models.CharField(max_length=50)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    proficiency = models.PositiveIntegerField(default=3)

    class Meta:
        ordering = ("-proficiency",)

    def __str__(self):
        return self.name


class Project(models.Model):
    resume = models.ForeignKey(
        Resume, on_delete=models.CASCADE, related_name="projects"
    )
    title = models.CharField(max_length=100)
    description = models.TextField()
    ai_enhanced_description = models.TextField(blank=True)
    tech_stack = models.CharField(max_length=200)
    url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        return self.title


class Certification(models.Model):
    resume = models.ForeignKey(
        Resume, on_delete=models.CASCADE, related_name="certifications"
    )
    name = models.CharField(max_length=100)
    issuer = models.CharField(max_length=100)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    credential_url = models.URLField(blank=True)

    class Meta:
        ordering = ("-issue_date",)

    def __str__(self):
        return self.name
