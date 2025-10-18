# Virinchi Portfolio

Modern, sectioned portfolio for Satya Sri Virinchi Junuthula built with React (TypeScript) on the frontend and FastAPI on the backend. The site exposes curated resume data, an interactive projects spotlight, GitHub repository search, and a contact form that forwards mail (or safely logs it while SMTP credentials are pending).

## Tech stack
- **Frontend:** React + TypeScript (Vite), custom design system, responsive layout
- **Backend:** FastAPI, httpx, SMTP integration with `.env` driven settings
- **Tooling:** npm, uvicorn, python-dotenv

## Repository layout
```
backend/
  app/
    data/profile.json   # Structured resume data surfaced through the API
    main.py             # FastAPI application entrypoint
    github_client.py    # GitHub API proxy and filtering
    mailer.py           # Contact form delivery (SMTP or local log)
    schemas.py          # Pydantic response/request models
  requirements.txt
  .env.example          # Backend environment template
frontend/
  src/                  # React application source
  .env.example          # Frontend environment template
Sri_Virinchi_resume.pdf # Linked through the backend /resume endpoint
```

## Getting started

### 1. Backend API
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # adjust values as needed
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

#### Contact delivery configuration
Update `backend/.env` with SMTP credentials to forward mail from the site (for example, a Gmail app password or SES credentials):
```
EMAIL_SMTP_HOST=smtp.yourprovider.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=you@example.com
EMAIL_SMTP_PASSWORD=app-password
EMAIL_FROM=portfolio@yourdomain.com
EMAIL_FORWARD_TO=your-email@example.com
```
If no SMTP host is provided, incoming messages are appended to `backend/app/data/messages.log` so nothing is lost during testing.

#### GitHub proxy
Set `GITHUB_USERNAME` in `backend/.env` to the account you want the gallery to expose. The backend filters repositories server-side and returns metadata (name, description, topics, stars, homepage, etc.).

### 2. Frontend app
```bash
cd frontend
npm install
cp .env.example .env  # defaults to http://localhost:8000
npm run dev
```
Launch dev mode at `http://localhost:5173`. The production build is available through `npm run build` (artifacts in `frontend/dist`).

## Key features
- **Hero & summary:** pulls headline, location, and specialties from `profile.json` with animated chips and configurable summary perspectives.
- **Spotlight gallery:** horizontally scrollable highlight cards with imagery and copy ready for storytelling.
- **Experience accordion:** collapsible detail panels covering role focus areas and quantified achievements.
- **Skills, education, timeline:** quick-read sections driven entirely from structured data, easy to refresh from the resume.
- **GitHub explorer:** proxies GitHub API through the backend, enabling keyword searches without exposing tokens.
- **Contact form:** validates input client-side and server-side, then dispatches via SMTP or logs locally until mail is configured.
- **Resume download:** `GET /resume` serves a local PDF or redirects to a hosted URL defined in `profile.json`.

## Customisation
- Update `backend/app/data/profile.json` to refresh content, specialties, imagery, and the resume link (local filenames or remote URLs are supported).
- Swap imagery URLs in the `spotlight` array (host local assets from the frontend if preferred).
- Extend the frontend color system or animations by editing `frontend/src/App.css`.

## Next steps
- Deploy FastAPI (e.g., on Render, Railway, or AWS) and serve the Vite build from a CDN or static host.
- Connect Route53, CloudFront, or similar to present the custom domain once deployed.
- Add analytics (PostHog, Plausible) and automate GitHub fetch caching if hosting at scale.
