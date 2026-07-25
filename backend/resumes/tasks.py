import os
import json
from celery import shared_task
from career.tasks import get_model
from groq import Groq
from django.core.files.base import ContentFile

@shared_task
def generate_embedding_for_jd(jd_id):
    from .models import JobDescription
    try:
        jd = JobDescription.objects.get(id=jd_id)
    except JobDescription.DoesNotExist:
        return

    model = get_model()
    embedding = model.encode(jd.raw_text, normalize_embeddings=True)
    jd.embedding = embedding.tolist()
    jd.save(update_fields=['embedding'])

EXTRACTION_PROMPT = """You are a job description parser. Given a job description, \
extract structured requirements as JSON with exactly this shape:

{{
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill1", "skill2"],
  "seniority": "entry|mid|senior|lead",
  "role_type": "short label e.g. 'Robotics Software Engineer'"
}}

Only include skills/technologies actually mentioned or clearly implied. \
Return ONLY the JSON object, no other text.

Job description:
{jd_text}
"""

GENERATION_PROMPT = """You are an expert resume writer. Given a candidate's relevant \
career entries and a target job's requirements, generate tailored resume content as \
JSON with exactly this shape:

{{
  "projects": [
    {{
      "title": "Project title",
      "year": "2026",
      "bullets": ["Rewritten, quantified bullet point tailored to the role", "..."]
    }}
  ],
  "experience": [
    {{
      "title": "Entry title",
      "year": "2026",
      "bullets": ["Rewritten, quantified bullet point tailored to the role", "..."]
    }}
  ]
}}

Rules:
- Rewrite bullet points to emphasize relevance to the target role and JD keywords.
- Keep bullets concise, action-verb led, quantified where the source data supports it.
- Do not invent achievements, metrics, or technologies not present in the source data.
- The number of bullets per entry should reflect how relevant that entry is to the \
role: highly relevant entries get 3-4 detailed bullets, tangentially relevant entries \
get 1-2 short bullets, and entries with no real relevance should be omitted entirely.
- Only include entries genuinely relevant to this role, most relevant first.
- Categorize each career entry into "projects" or "experience" based on its category \
field (project vs experience/leadership).
- Return ONLY the JSON object, no other text.

Candidate's relevant career entries (each includes its category):
{entries_text}

Target role: {role_type} ({seniority})
Required skills: {required_skills}
Preferred skills: {preferred_skills}
"""

@shared_task
def parse_job_description(jd_id):
    from .models import JobDescription

    try:
        jd = JobDescription.objects.get(id=jd_id)
    except JobDescription.DoesNotExist:
        return

    client = Groq(api_key=os.environ.get('GROQ_API_KEY'))

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": EXTRACTION_PROMPT.format(jd_text=jd.raw_text)}
        ],
        response_format={"type": "json_object"},
    )

    try:
        parsed = json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        parsed = {"error": "Failed to parse model output"}

    jd.parsed_requirements = parsed
    jd.save(update_fields=['parsed_requirements'])

@shared_task
def generate_resume(resume_id, jd_id):
    from .models import Resume, ResumeVersion, JobDescription
    from career.services import get_relevant_entries

    resume = Resume.objects.get(id=resume_id)
    jd = JobDescription.objects.get(id=jd_id)

    entries = get_relevant_entries(resume.user, jd.embedding, top_n=8)
    entries_text = "\n\n".join(
        f"- [{e.category}] {e.title}: {e.description} (Tech: {', '.join(e.tech_stack)})"
        for e in entries
    )

    req = jd.parsed_requirements or {}

    client = Groq(api_key=os.environ.get('GROQ_API_KEY'))
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": GENERATION_PROMPT.format(
                entries_text=entries_text,
                role_type=req.get('role_type', 'this role'),
                seniority=req.get('seniority', 'unspecified'),
                required_skills=', '.join(req.get('required_skills', [])),
                preferred_skills=', '.join(req.get('preferred_skills', [])),
            )
        }],
        response_format={"type": "json_object"},
    )

    content = json.loads(response.choices[0].message.content)

    next_version = ResumeVersion.objects.filter(resume=resume).count() + 1
    version = ResumeVersion.objects.create(
        resume=resume,
        version_number=next_version,
        content=content,
    )
    compile_resume_pdf.delay(version.id)

@shared_task
def compile_resume_pdf(resume_version_id):
    from .models import ResumeVersion
    from .latex import render_resume_tex, compile_latex_to_pdf

    version = ResumeVersion.objects.get(id=resume_version_id)

    context = {
        'projects': version.content.get('projects', []),
        'experience': version.content.get('experience', []),
    }

    tex_content = render_resume_tex(context)

    try:
        pdf_bytes = compile_latex_to_pdf(tex_content)
    except RuntimeError as e:
        version.diff_from_previous = {'compile_error': str(e)}
        version.save(update_fields=['diff_from_previous'])
        return

    filename = f"resume_v{version.version_number}.pdf"
    version.pdf_file.save(filename, ContentFile(pdf_bytes), save=True)