import json
from datetime import date

from groq import Groq
from django.conf import settings
from django.core.cache import cache

from .models import Resume, Summary

client = Groq(api_key=settings.GROQ_API_KEY)

DAILY_AI_LIMIT = 100
CACHE_KEY_PREFIX = "ai_call_count_"

MODEL = "llama-3.1-8b-instant"


class AIServiceException(Exception):
    pass


def rate_limit_check():
    today = date.today().isoformat()
    key = f"{CACHE_KEY_PREFIX}{today}"
    count = cache.get(key, 0)
    if count >= DAILY_AI_LIMIT:
        raise AIServiceException(
            f"Daily AI call limit of {DAILY_AI_LIMIT} reached. Try again tomorrow."
        )
    cache.set(key, count + 1, timeout=86400)


def _call_groq(prompt: str) -> str:
    try:
        rate_limit_check()
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()
    except AIServiceException:
        raise
    except Exception as e:
        raise AIServiceException(f"Groq API call failed: {e}") from e


def enhance_summary(raw_text: str, job_title: str = "") -> str:
    prompt = f"""Rewrite the following notes into a 3-4 sentence professional summary for a {job_title or "general"} position.

Rules:
- Start with a strong opener — never start with "I am" or "I'm"
- Use active, confident language
- Avoid clichés like "hardworking", "passionate", "team player", "detail-oriented"
- Focus on measurable impact and expertise
- Return ONLY the rewritten text, no headers, no labels, no quotation marks

Notes to rewrite:
{raw_text}"""
    return _call_groq(prompt)


def enhance_experience(raw_description: str, job_title: str, company: str) -> str:
    prompt = f"""Convert the following raw notes for the role of {job_title} at {company} into 4-5 resume bullet points.

Rules:
- Each bullet must start with a strong action verb (e.g., Led, Built, Reduced, Increased, Designed, Optimized)
- Include specific metrics or numbers wherever possible
- Focus on impact and results, not routine duties
- Each bullet on its own line starting with •
- Return ONLY the bullet points, no headers, no explanations

Raw notes:
{raw_description}"""
    return _call_groq(prompt)


def enhance_project(title: str, description: str, tech_stack: str) -> str:
    prompt = f"""Write 2-3 sentences describing the following project for a professional resume.

Rules:
- Mention the problem the project solves
- Mention key technologies used: {tech_stack}
- Mention the impact, scale, or outcome if applicable
- Be concise and results-oriented
- Return ONLY the description, no labels

Project title: {title}
Description: {description}"""
    return _call_groq(prompt)


def generate_tips(resume_data: dict) -> list[str]:
    prompt = f"""Analyze the following resume data and provide exactly 5 specific, actionable tips to improve it.

Rules:
- Each tip must be a single clear sentence
- Tips should be concrete and specific to the data provided
- Response must be ONLY a valid JSON array of strings, no markdown, no code fences, no explanation

Resume data:
{json.dumps(resume_data, indent=2)}

Return a JSON array of 5 strings:"""
    raw = _call_groq(prompt)
    try:
        tips = json.loads(raw)
        if isinstance(tips, list) and len(tips) == 5:
            return tips
    except json.JSONDecodeError:
        pass
    lines = [line.strip().lstrip("-•*\"'") for line in raw.split("\n") if line.strip()]
    return lines[:5]


def calculate_ats_score(resume_data: dict, job_description: str) -> dict:
    prompt = f"""Analyze the following resume against the job description and return a JSON object with:
- "score": an integer from 0 to 100 matching the resume to the job
- "matching_keywords": a list of keywords present in both resume and job description
- "missing_keywords": a list of important keywords from the job description missing from the resume
- "suggestions": a list of 3-5 specific suggestions to improve the resume for this job

Return ONLY valid JSON, no markdown, no explanation.

Resume data:
{json.dumps(resume_data, indent=2)}

Job description:
{job_description}"""
    raw = _call_groq(prompt)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "score": 50,
            "matching_keywords": [],
            "missing_keywords": [],
            "suggestions": ["Unable to parse AI response. Please try again."],
        }


def enhance_all(resume: Resume) -> dict:
    counts = {"summaries": 0, "experiences": 0, "projects": 0}

    try:
        summary = resume.summary
    except Summary.DoesNotExist:
        summary = None

    if summary and summary.raw_text:
        job_title = ""
        try:
            pi = resume.personal_info
            job_title = pi.full_name if pi else ""
        except Exception:
            job_title = resume.title
        enhanced = enhance_summary(summary.raw_text, job_title)
        summary.ai_enhanced_text = enhanced
        summary.save()
        counts["summaries"] = 1

    for exp in resume.experiences.all():
        if exp.raw_description:
            enhanced = enhance_experience(exp.raw_description, exp.job_title, exp.company)
            exp.ai_enhanced_description = enhanced
            exp.save()
            counts["experiences"] += 1

    for proj in resume.projects.all():
        if proj.description:
            enhanced = enhance_project(proj.title, proj.description, proj.tech_stack)
            proj.ai_enhanced_description = enhanced
            proj.save()
            counts["projects"] += 1

    if counts["summaries"] or counts["experiences"] or counts["projects"]:
        resume.is_ai_enhanced = True
        resume.save(update_fields=["is_ai_enhanced"])

    return counts
