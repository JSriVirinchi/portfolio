# Virinchi Portfolio

Personal portfolio for **Satya Sri Virinchi Junuthula** — a responsive React + TypeScript
single-page app with a small FastAPI backend. It's built to **load instantly**: all
content is bundled into the frontend and served from a CDN, so *no backend call happens
on page load*. The backend exists only to deliver contact-form messages.

## Architecture

```
Browser ──> CloudFront  (static SPA: HTML/JS/CSS + bundled profile.json)
   │
   ├─> api.github.com           (repos + contribution heatmap, fetched in-browser)
   └─> API Gateway ─> Lambda    (POST /api/contact only) ─> Amazon SES
```

- **Frontend:** React 19 + TypeScript (Vite). Profile content is bundled
  (`frontend/src/data/profile.json`) and GitHub data is fetched directly in the browser
  → instant load, no cold-start delay.
- **Backend:** FastAPI on AWS Lambda (via Mangum) behind an API Gateway HTTP API. The
  live site only calls `POST /api/contact`, which sends email through Amazon SES.
  (`/api/profile`, `/api/github/repos`, `/resume`, `/health` still exist but are no
  longer used by the site.)

## Repository layout

```
template.yaml                  # AWS SAM — backend Lambda + HTTP API + SES
infra/
  frontend-cloudfront.yaml     # CloudFormation — S3 + CloudFront + ACM + Route53
  DEPLOY.md                    # All-AWS deployment runbook (start here to deploy)
frontend/
  src/
    data/profile.json          # ← SITE CONTENT — edit this to update the site
    components/ hooks/ api/     # React app
    App.css                    # design system + responsive rules
  index.html                   # tab title / meta tags
backend/
  app/
    main.py                    # FastAPI app + Mangum Lambda handler
    mailer.py                  # contact delivery: SES / SendGrid / local log
    config.py schemas.py github_client.py profile_loader.py
    data/profile.json          # legacy copy — NOT used by the live site
  requirements.txt
  .env.example
```

## Running locally

Two processes. The frontend renders entirely on its own; the backend is only needed if
you want to exercise the contact form.

### 1. Frontend (required)

```bash
cd frontend
npm install
npm run dev
```

Opens at **http://localhost:5173** with hot-module reload. Profile and GitHub data need
no backend, so the full site works with just this.

### 2. Backend (optional — only for the contact form)

Use **Python 3.12** — it matches the Lambda runtime, and pydantic's wheels may not build
on newer interpreters:

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # turnkey for local dev (EMAIL_PROVIDER=log)
uvicorn app.main:app --reload
```

Runs at **http://localhost:8000**. `.env.example` ships with `EMAIL_PROVIDER=log`, so
contact submissions are appended to `backend/app/data/messages.log` instead of sending
real email — no credentials required. The frontend targets `http://localhost:8000` by
default; override with `VITE_API_BASE_URL` in `frontend/.env` if needed.

## Editing site content

Edit **`frontend/src/data/profile.json`** — name, headline, location, experience, skills,
education, spotlight cards, social links, and résumé URL. Saves hot-reload instantly.
Skill icons reference devicon CDN URLs; the résumé is a direct link. To change the browser
tab title, edit `<title>` in `frontend/index.html`.

## Email delivery (backend)

`backend/app/mailer.py` chooses a provider from the `EMAIL_PROVIDER` env var:

| Value | Behaviour |
|-------|-----------|
| `ses` | Amazon SES (production / all-AWS). Needs a verified `EMAIL_FROM` identity. |
| `sendgrid` | SendGrid HTTP API (`SENDGRID_API_KEY`). |
| `log` | Append to `messages.log` — local default, no credentials. |
| `auto` (default) | SES when an AWS region is present (e.g. on Lambda) and no SendGrid key; otherwise log. |

## Deployment (All-AWS)

Hosted entirely on AWS in a **dedicated AWS Organizations member account** — isolated from
other projects, with consolidated billing:

- `template.yaml` — SAM: FastAPI on Lambda + API Gateway HTTP API + SES permissions.
- `infra/frontend-cloudfront.yaml` — private S3 bucket served via CloudFront, TLS by ACM, DNS by Route53.

➡️ **Follow the step-by-step runbook in [`infra/DEPLOY.md`](infra/DEPLOY.md)** — it covers
creating the dedicated account, the DNS cutover to Route53, SES verification, and every
deploy command (with `--profile portfolio` so nothing lands in the wrong account).

**Cost** at portfolio traffic: ~**$0.50/month** (the Route53 hosted zone); Lambda, API
Gateway, S3, CloudFront, and SES are effectively free. Add an AWS Budget alarm (~$5) as a
safety net.

### Previous hosting — decommission after cutover

The site previously ran on **Vercel** (frontend) + **Render** (backend, SendGrid email),
with DNS through GoDaddy → Vercel. Once the AWS deployment is verified:

1. Delete the **Render** web service.
2. Delete the **Vercel** project and repoint the **GoDaddy** nameservers to Route53.
3. SendGrid is no longer used (SES replaces it) — keep or close the account.

⚠️ Don't delete the GoDaddy *domain registration* itself — you're only changing nameservers.
