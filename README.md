# Krear: AI-Powered Career Intelligence Platform

Krear helps you manage a structured "Career Bank" of your projects, experience, and
skills, then uses retrieval-augmented generation to tailor resumes to specific job
descriptions — complete with an ATS parseability score before you send anything out.

## What it does

1. **Career Bank** — a structured database of your projects, experience, and skills
   (not a blob of resume text) that acts as the single source of truth for everything
   downstream.
2. **JD Analyzer** — paste a job description, get back structured requirements
   (required/preferred skills, seniority, role type) extracted by an LLM, plus a
   match score against your Career Bank and a list of missing keywords.
3. **AI Resume Generator** — given a JD, retrieves your most relevant Career Bank
   entries via vector similarity search, then generates tailored resume content and
   compiles it into a polished PDF via LaTeX.
4. **ATS Score Checker** — re-parses the compiled PDF the way an ATS system would,
   checking for content match, font/glyph issues, and section-order problems that a
   human eye won't catch but a resume parser will.

## Stack

**Backend:** Django + Django REST Framework + PostgreSQL + `pgvector` + Celery/Redis
**AI:** Groq (Llama 3.3 70B) for JD parsing and resume generation; `bge-small-en-v1.5`
via Hugging Face's hosted Inference API for embeddings
**PDF pipeline:** Jinja2 → LaTeX → Tectonic
**Frontend:** React + Vite + TanStack Router/Query + Tailwind + shadcn/ui

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Frontend   │ ───▶ │   Django + DRF    │ ───▶ │  PostgreSQL  │
│ (React/Vite) │      │   (JWT auth)      │      │  + pgvector  │
└─────────────┘      └──────────────────┘      └─────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │ Celery + Redis │
                      │ (async tasks)  │
                      └──────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
          Embeddings     JD Parsing    Resume Gen
        (bge-small via   (Groq/Llama)  + LaTeX/PDF
         HF Inference                  compilation
         API)
```

Embeddings are generated via Hugging Face's hosted Inference API rather than
in-process — running `sentence-transformers`/`torch` locally exceeded Render's
free-tier 512MB memory limit at idle, so `torch`/`transformers`/
`sentence-transformers` were removed from `requirements.txt` entirely. JD parsing
and resume tailoring go through Groq's hosted Llama 3.3 70B.

## Project structure

```
krear/
  backend/     Django + DRF API, Celery workers, LaTeX/ATS pipeline
  frontend/    React + Vite SPA
```

## Local development

### Prerequisites
- Python 3.12+
- Node 20+
- Docker (for Postgres + Redis)
- Tectonic (or another LaTeX distribution with `latexmk`) on your PATH

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

docker run -d --name krear-db -p 5432:5432 pgvector/pgvector:pg16
docker run -d --name krear-redis -p 6379:6379 redis:7-alpine

python manage.py migrate
python manage.py seed_career_data   # optional: sample data
python manage.py runserver
```

In a separate terminal, start the Celery worker (required for embeddings, JD
parsing, and resume generation — these all run async):
```bash
cd backend && celery -A config worker -l info
```

Required environment variables (`.env`, not committed):
```
SECRET_KEY=...
GROQ_API_KEY=...
HF_TOKEN=...
DEBUG=True
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Set `VITE_API_URL` in `.env.local` if the backend isn't on `http://localhost:8000`.

## Deployment

- **Backend** — containerized via `backend/Dockerfile` (includes Tectonic and its
  required system libraries: `libgraphite2-3`, `libharfbuzz0b`, `libfontconfig1`,
  `libicu-dev`). Deployed on Render as a single web process
  (`entrypoint.sh` → migrate → collectstatic → gunicorn, with a Celery worker
  running alongside it). Requires Postgres (with `pgvector` enabled) and Redis.
  Generated PDFs are stored as binary data directly in Postgres rather than on
  local disk, since Render's free-tier filesystem is ephemeral and resets on
  container restarts.
- **Frontend** — static Vite build (`npm run build` → `dist/`), deployed on Vercel
  behind a rewrite rule that funnels all routes to `index.html` (see
  `frontend/vercel.json`) since routing is entirely client-side.
- **Path-filtered deploys** — frontend-only and backend-only commits no longer
  trigger cross-service rebuilds:
  - Render: Settings → Build → Build Filters → Included Paths → `backend/**`
  - Vercel: Settings → Build and Deployment → Ignored Build Step, using
    `git diff --quiet $VERCEL_GIT_PREVIOUS_SHA HEAD -- frontend/`
    (avoid `HEAD^`-based diffs — Vercel's shallow clone doesn't reliably have
    prior history, which can make the check silently skip real changes)

## Project status

Career Bank CRUD, embeddings pipeline, JD analysis with match scoring, AI resume
generation with LaTeX/PDF compilation (Projects, Experience, and Education
sections all dynamic per-user), and ATS parseability scoring are working
end-to-end and deployed.

**Not yet multi-user-safe:** the resume template's header (name/phone/email/
LinkedIn/GitHub), Leadership section, and Technical Skills section are still
hardcoded to the original account's data rather than pulled from each user's own
profile/Career Bank/Skill records. A `Profile` model, its API endpoint, and a
frontend settings page don't exist yet — this is the next planned unit of work,
followed by finishing the template's dynamic sections, adding generation-status
notifications/progress UI, and then refining prompt and ATS-scoring quality.

Application tracker (`applications` app) is scaffolded on the backend
(models/serializers/views/urls) but has no frontend routes yet. Cover letter
generation is modeled but not yet built out.

## License

Personal/portfolio project — not currently licensed for reuse.