# Resumind — AI Resume Builder

> Build professional resumes with AI-powered enhancement, multiple templates, and one-click PDF export.

## Features

- **AI Enhancement** — Rewrite summaries, bullet points, and project descriptions with Gemini AI
- **Multiple Templates** — Modern (two-column), Classic (traditional), Minimal (clean) — switch anytime
- **PDF Export** — A4-formatted PDFs via WeasyPrint with full customization
- **Live Preview** — See changes in real-time with color, font, and section visibility controls
- **ATS Score** — Analyze your resume against any job description (matching keywords + score)
- **Shareable Links** — Generate public resume links to share with recruiters
- **Resume Duplication** — Clone existing resumes as a starting point
- **AI Tips** — Get 5 actionable suggestions to improve your resume
- **Auto-save** — Debounced save (800ms) so you never lose work
- **PWA** — Installable on mobile/desktop with offline support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, Django 4.2, Django REST Framework |
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| AI | Google Gemini 1.5 Flash (`google-genai`) |
| Database | PostgreSQL |
| Auth | JWT (SimpleJWT) with token refresh/blacklist |
| PDF | WeasyPrint (3 templates) |
| File Storage | Cloudinary |
| Rate Limiting | django-ratelimit (20 AI calls/user/hour) |

## Project Structure

```
resumind/
├── backend/
│   ├── config/              # Django settings, WSGI, URLs
│   ├── resumes/             # Resume CRUD, AI, PDF, endpoints
│   │   ├── management/commands/
│   │   │   ├── seed_example_resume.py
│   │   │   └── cleanup_old_pdfs.py
│   │   └── templates/resumes/
│   │       ├── modern.html
│   │       ├── classic.html
│   │       └── minimal.html
│   └── users/               # Auth views, UserProfile
├── frontend/
│   ├── public/
│   │   ├── manifest.json    # PWA manifest
│   │   └── sw.js            # Service worker
│   └── src/
│       ├── api/             # Axios instance + API functions
│       ├── store/           # Zustand auth store
│       ├── pages/           # Landing, Login, Register, Dashboard, Builder, Preview
│       └── components/      # UI, builder steps, AI components, preview
├── backend/requirements.txt
├── backend/Dockerfile
├── backend/render.yaml
├── frontend/vercel.json
└── README.md
```

## Local Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 15+
- GTK runtime (Windows only — for WeasyPrint PDF export)

### 1. Clone & Environment

```bash
git clone <repo-url>
cd resumind

# Backend env
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend env
cp frontend/.env.example frontend/.env
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_example_resume
python manage.py runserver
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` — demo login: `demo` / `demo1234`

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | — | Django secret key |
| `DEBUG` | No | `False` | Django debug mode |
| `ALLOWED_HOSTS` | No | `localhost,127.0.0.1` | Comma-separated hosts |
| `DB_NAME` | Yes | — | PostgreSQL database name |
| `DB_USER` | Yes | — | PostgreSQL user |
| `DB_PASSWORD` | Yes | — | PostgreSQL password |
| `DB_HOST` | No | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `CLOUDINARY_CLOUD_NAME` | For uploads | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | — | Cloudinary API secret |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:8000/api` | Backend API URL |

## API Documentation

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, returns JWT |
| POST | `/api/auth/logout/` | Logout (blacklist refresh token) |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | Get user profile |
| PUT | `/api/auth/profile/` | Update user profile |

### Resumes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resumes/` | List resumes (pagination, search, filter) |
| POST | `/api/resumes/` | Create resume |
| GET | `/api/resumes/{id}/` | Get resume with all sections |
| PUT | `/api/resumes/{id}/` | Update resume |
| DELETE | `/api/resumes/{id}/` | Delete resume |
| POST | `/api/resumes/{id}/duplicate/` | Deep-copy resume |
| POST | `/api/resumes/{id}/toggle_public/` | Toggle public sharing |
| POST | `/api/resumes/{id}/enhance_summary/` | AI enhance summary |
| POST | `/api/resumes/{id}/enhance_experience/` | AI enhance experience |
| POST | `/api/resumes/{id}/enhance_project/` | AI enhance project |
| POST | `/api/resumes/{id}/enhance_all/` | AI enhance all sections |
| POST | `/api/resumes/{id}/ats_score/` | Get ATS match score |
| GET | `/api/resumes/{id}/tips/` | Get AI improvement tips |
| GET | `/api/resumes/{id}/preview/` | Get resume HTML |
| GET | `/api/resumes/{id}/export_pdf/` | Download PDF |

### Sub-resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/experiences/` | Experience CRUD + reorder |
| CRUD | `/api/education/` | Education CRUD + reorder |
| CRUD | `/api/skills/` | Skill CRUD + bulk_create |
| CRUD | `/api/projects/` | Project CRUD |
| CRUD | `/api/certifications/` | Certification CRUD |

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/{slug}/` | Get public resume (no auth) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Health check `{"status": "ok", ...}` |

### Query params

- `?search=engineer` — search by title
- `?template=modern` — filter by template
- `?ordering=created_at` — order results
- `?page=2&page_size=20` — pagination (default 10, max 50)

## Deployment

### Backend (Render)

1. Push to GitHub
2. In Render dashboard: **New Web Service** → connect repo
3. Set:
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --timeout 120`
   - **Pre-deploy Command**: `python manage.py migrate --noinput`
4. Add environment variables from the table above
5. Create a PostgreSQL database in Render and link it

### Frontend (Vercel)

1. Push to GitHub
2. In Vercel dashboard: **New Project** → connect repo
3. Set:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. The `vercel.json` in `frontend/` handles SPA routing

### Docker

```bash
cd backend
docker build -t resumind-api .
docker run -p 8000:8000 --env-file .env resumind-api
```

## Error Format

All API errors follow a consistent format:

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {}
}
```

HTTP 429 (rate limited) responses include `"code": "RATE_LIMITED"`.

## License

MIT
