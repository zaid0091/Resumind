from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Seeds an example resume for a demo user"

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username="demo",
            defaults={"email": "demo@example.com"},
        )
        if created:
            user.set_password("demo1234")
            user.save()
            self.stdout.write(self.style.SUCCESS("Created demo user"))
        else:
            self.stdout.write("Demo user already exists")

        from resumes.models import Resume, PersonalInfo, Summary, Experience, Education, Skill, Project, Certification

        if Resume.objects.filter(user=user).exists():
            self.stdout.write("Demo user already has a resume. Skipping.")
            return

        resume = Resume.objects.create(
            user=user,
            title="Software Engineer - John Doe",
            template="modern",
        )

        PersonalInfo.objects.create(
            resume=resume,
            full_name="John Doe",
            email="john.doe@example.com",
            phone="+1 (555) 123-4567",
            location="San Francisco, CA",
            linkedin="https://linkedin.com/in/johndoe",
            github="https://github.com/johndoe",
            portfolio="https://johndoe.dev",
        )

        Summary.objects.create(
            resume=resume,
            raw_text="Experienced software engineer with 5+ years building web applications.",
            use_ai_version=False,
        )

        Experience.objects.create(
            resume=resume,
            job_title="Senior Software Engineer",
            company="Tech Corp",
            location="San Francisco, CA",
            start_date="2022-01-01",
            end_date=None,
            is_current=True,
            raw_description="• Led a team of 5 engineers\n• Architected microservices\n• Reduced deployment time by 40%",
            order=1,
        )

        Experience.objects.create(
            resume=resume,
            job_title="Software Engineer",
            company="Startup Inc",
            location="Remote",
            start_date="2019-03-01",
            end_date="2021-12-31",
            is_current=False,
            raw_description="• Built REST APIs\n• Implemented CI/CD\n• Wrote automated tests",
            order=2,
        )

        Education.objects.create(
            resume=resume,
            degree="B.S. Computer Science",
            institution="University of California",
            location="Berkeley, CA",
            start_year=2015,
            end_year=2019,
            gpa=3.7,
            honors="Dean's List",
            order=1,
        )

        for skill_data in [
            ("Python", "Technical", 90),
            ("React", "Technical", 85),
            ("JavaScript", "Technical", 85),
            ("TypeScript", "Technical", 75),
            ("Django", "Technical", 80),
            ("PostgreSQL", "Technical", 75),
            ("AWS", "Technical", 70),
            ("Docker", "Technical", 70),
            ("Project Management", "Soft Skills", 85),
            ("Team Leadership", "Soft Skills", 80),
        ]:
            Skill.objects.create(resume=resume, name=skill_data[0], category=skill_data[1], proficiency=skill_data[2])

        Project.objects.create(
            resume=resume,
            title="E-Commerce Platform",
            description="Built a full-stack e-commerce platform with payment integration.",
            tech_stack="React, Django, Stripe, PostgreSQL",
            url="https://github.com/johndoe/ecommerce",
            order=1,
        )

        Project.objects.create(
            resume=resume,
            title="Task Management App",
            description="Real-time collaborative task management application.",
            tech_stack="React, Node.js, Socket.io, MongoDB",
            url="https://github.com/johndoe/taskman",
            order=2,
        )

        Certification.objects.create(
            resume=resume,
            name="AWS Certified Solutions Architect",
            issuer="Amazon Web Services",
            issue_date="2023-06-01",
            credential_url="https://aws.amazon.com/verify/cert",
        )

        self.stdout.write(self.style.SUCCESS(f"Created example resume: {resume.title}"))
