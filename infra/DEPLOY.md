# All-AWS deployment

Move the portfolio off Vercel + Render onto AWS:

| Piece | Service |
|-------|---------|
| Frontend (static `frontend/dist`, **incl. profile data**) | **S3** (private) + **CloudFront** + **ACM** |
| Backend (FastAPI — **contact form only**) | **Lambda** + **API Gateway HTTP API** (via AWS SAM) |
| Contact email | **Amazon SES** |
| DNS / TLS | **Route53** + **ACM** |

> **The site renders entirely from CloudFront with no backend call.** Profile
> content is bundled into the frontend and GitHub repos are fetched in-browser,
> so the only thing the Lambda does is receive contact-form submissions. There is
> no cold-start delay on page load; a one-time ~1s Lambda warm-up can only ever
> affect a contact-form submit, which is invisible to the user.

> **Pick one region and use it for everything: `us-east-1`.** CloudFront's ACM
> certificate *must* live in `us-east-1`, so keeping the API there too avoids
> cross-region cert juggling.

## Step 0 — Dedicated AWS account (Organizations)

Keep the portfolio fully separate from the `satyalokam` project while sharing one bill:

1. In your **management/payer account**, open **AWS Organizations** (enable it if
   this is the first time).
2. **Add an AWS account** → name it e.g. `virinchi-portfolio`, email
   `your-email+portfolio@gmail.com` (the `+alias` trick reuses your inbox).
   Billing automatically consolidates to the payer account.
3. Get CLI access to the new account — either via **IAM Identity Center (SSO)** or
   by assuming its `OrganizationAccountAccessRole`. Configure a named profile:
   ```bash
   aws configure sso --profile portfolio   # or set up an assume-role profile
   aws sts get-caller-identity --profile portfolio   # confirm you're in the new account
   ```
4. **Append `--profile portfolio` to every `aws`/`sam` command below** so nothing
   lands in the satyalokam account (`029001184601`).

## Prerequisites (install locally)

- **AWS CLI** — already installed (`aws configure` with an admin-ish profile).
- **AWS SAM CLI** — not installed yet: `brew install aws-sam-cli`.
- **Docker** — not installed yet, but **required** for `sam build --use-container`.
  `pydantic` v2 ships a compiled (`pydantic-core`) binary; building without
  `--use-container` on macOS produces a macOS binary that **crashes on Lambda**.
  Install Docker Desktop, or build on a Linux box / in CI instead.

---

## Step 1 — Route53 hosted zone (do this first)

DNS currently runs through Vercel. To use Route53:

1. `aws route53 create-hosted-zone --profile portfolio --name virinchijunuthula.com --caller-reference $(date +%s)`
2. Note the 4 `NS` records on the new zone, and the **Hosted Zone ID**.
3. In **GoDaddy**, change the domain's nameservers to those 4 Route53 NS values.
4. Wait for propagation (minutes to a few hours). Verify: `dig NS virinchijunuthula.com`.

ACM DNS validation and the alias records below only work once Route53 is authoritative.

## Step 2 — SES (email)

1. In SES (`us-east-1`) → **Verified identities**, verify the sender
   (`portfolio@virinchijunuthula.com` or the apex domain — domain + DKIM is best).
2. SES starts in **sandbox**: you can only send to verified addresses. Either
   verify `virinchi.junuthula@gmail.com` (the contact-form recipient) too, or
   request production access. For a contact form that only emails *you*, verifying
   your own address is enough.

## Step 3 — Backend (Lambda + HTTP API)

From the repo root (where `template.yaml` lives):

```bash
sam build --use-container
sam deploy --guided \
  --profile portfolio \
  --region us-east-1 \
  --stack-name portfolio-backend \
  --capabilities CAPABILITY_IAM
```

When prompted, set parameters:

- `EmailFrom` = your SES-verified sender
- `EmailForwardTo` = `virinchi.junuthula@gmail.com`
- `FrontendOrigin` = `https://virinchijunuthula.com`
- For the `api.` subdomain (optional but recommended), first create a **regional**
  ACM cert in `us-east-1` for `api.virinchijunuthula.com` (DNS-validated in the
  zone from Step 1), then pass `ApiDomainName`, `ApiCertificateArn`, `HostedZoneId`.
  Leave them blank to launch on the raw `*.execute-api.amazonaws.com` URL first.

Grab the `ApiBaseUrl` (or `CustomDomainUrl`) from the stack outputs.

## Step 4 — Frontend (S3 + CloudFront)

1. Deploy the hosting stack **in us-east-1**:

   ```bash
   aws cloudformation deploy \
     --profile portfolio \
     --region us-east-1 \
     --template-file infra/frontend-cloudfront.yaml \
     --stack-name portfolio-frontend \
     --parameter-overrides DomainName=virinchijunuthula.com HostedZoneId=<ZONE_ID>
   ```

   (ACM validation auto-completes via Route53; CloudFront takes ~15 min.)

2. Build the site pointing at the API, then upload:

   ```bash
   cd frontend
   VITE_API_BASE_URL=https://api.virinchijunuthula.com npm run build
   aws s3 sync dist "s3://$(aws cloudformation describe-stacks --profile portfolio \
     --stack-name portfolio-frontend --region us-east-1 \
     --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' --output text)" \
     --delete --profile portfolio
   ```

   > `VITE_API_BASE_URL` is now only used by the contact form. If you skip the
   > `api.` custom domain, set it to the `ApiBaseUrl` from the backend stack output.

3. Invalidate the CDN cache after each deploy:

   ```bash
   aws cloudfront create-invalidation --profile portfolio --paths '/*' --distribution-id <DISTRIBUTION_ID>
   ```

## Step 5 — Cut over & decommission

- Confirm `https://virinchijunuthula.com` and `https://api.virinchijunuthula.com/health` work.
- Test the contact form (check the SES-delivered email).
- Delete the Render service and the Vercel project once you're happy.

## Redeploy cheatsheet

- **Backend code change:** `sam build --use-container && sam deploy`
- **Frontend change:** `npm run build` → `aws s3 sync … --delete` → CloudFront invalidation
- Wire these into GitHub Actions later for push-to-`main` deploys.

## Notes / caveats

- **Editing site content:** the live site renders from `frontend/src/data/profile.json`
  — edit that file to update your bio, experience, skills, etc. `backend/app/data/profile.json`
  is no longer used by the site (only the now-idle `/api/profile` + `/resume` endpoints),
  so you can ignore it, or delete it together with those endpoints for a contact-only backend.
- **GitHub repos** are fetched in-browser from the unauthenticated GitHub API
  (60 requests/hr per visitor IP). Fine for portfolio traffic; if you ever hit the
  limit, route that one call back through the Lambda.
- `GET /resume` currently redirects to a Google Drive link, so no file is read on
  Lambda. If you switch to a bundled local PDF, it must ship inside `backend/`
  (the package is read-only at runtime, which is fine for reads).
- The contact-form local-log fallback now writes to `/tmp` on Lambda, but with
  `EMAIL_PROVIDER=ses` that path isn't used — SES is the delivery mechanism.
- `boto3` is preinstalled in the Lambda runtime; it's pinned in `requirements.txt`
  for local dev. Drop it there if you want a slimmer deployment package.
