from rest_framework import serializers

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


class PersonalInfoSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = PersonalInfo
        fields = "__all__"
        extra_kwargs = {
            "full_name": {"allow_blank": True, "required": False},
            "email": {"allow_blank": True, "required": False},
            "phone": {"allow_blank": True, "required": False},
            "location": {"allow_blank": True, "required": False},
            "linkedin": {"allow_blank": True, "required": False},
            "github": {"allow_blank": True, "required": False},
            "portfolio": {"allow_blank": True, "required": False},
        }

    def get_profile_photo(self, obj):
        if obj.profile_photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None


class SummarySerializer(serializers.ModelSerializer):
    active_text = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Summary
        fields = "__all__"
        extra_kwargs = {
            "raw_text": {"allow_blank": True, "required": False},
            "ai_enhanced_text": {"allow_blank": True, "required": False},
            "target_job_title": {"allow_blank": True, "required": False},
        }

    def get_active_text(self, obj):
        return obj.ai_enhanced_text if obj.use_ai_version else obj.raw_text


class ExperienceSerializer(serializers.ModelSerializer):
    active_description = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Experience
        fields = "__all__"

    def get_active_description(self, obj):
        return (
            obj.ai_enhanced_description
            if obj.use_ai_version
            else obj.raw_description
        )

    def validate(self, attrs):
        if not attrs.get("is_current") and attrs.get("end_date") and attrs.get("start_date"):
            if attrs["end_date"] <= attrs["start_date"]:
                raise serializers.ValidationError(
                    {"end_date": "End date must be after start date."}
                )
        return attrs


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = "__all__"


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    active_description = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = "__all__"

    def get_active_description(self, obj):
        return obj.ai_enhanced_description or obj.description


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = "__all__"


class ResumeListSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.ReadOnlyField()
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Resume
        fields = (
            "id",
            "user",
            "title",
            "template",
            "is_ai_enhanced",
            "is_public",
            "completion_percentage",
            "created_at",
            "updated_at",
        )


class PublicResumeSerializer(serializers.ModelSerializer):
    personal_info = PersonalInfoSerializer(read_only=True)
    summary = SummarySerializer(read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Resume
        fields = (
            "id",
            "title",
            "template",
            "is_ai_enhanced",
            "completion_percentage",
            "personal_info",
            "summary",
            "experiences",
            "education",
            "skills",
            "projects",
            "certifications",
        )


class ResumeDetailSerializer(serializers.ModelSerializer):
    personal_info = PersonalInfoSerializer(required=False)
    summary = SummarySerializer(required=False)
    experiences = ExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Resume
        fields = (
            "id",
            "user",
            "title",
            "template",
            "is_ai_enhanced",
            "completion_percentage",
            "created_at",
            "updated_at",
            "personal_info",
            "summary",
            "experiences",
            "education",
            "skills",
            "projects",
            "certifications",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")

    def create(self, validated_data):
        personal_info_data = validated_data.pop("personal_info", None)
        summary_data = validated_data.pop("summary", None)
        resume = Resume.objects.create(**validated_data)
        if personal_info_data:
            PersonalInfo.objects.create(resume=resume, **personal_info_data)
        if summary_data:
            Summary.objects.create(resume=resume, **summary_data)
        return resume

    def update(self, instance, validated_data):
        personal_info_data = validated_data.pop("personal_info", None)
        summary_data = validated_data.pop("summary", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if personal_info_data is not None:
            PersonalInfo.objects.update_or_create(
                resume=instance, defaults=personal_info_data
            )
        if summary_data is not None:
            Summary.objects.update_or_create(
                resume=instance, defaults=summary_data
            )
        return instance
