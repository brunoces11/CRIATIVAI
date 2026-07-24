# CriativAI

CriativAI site with a React/Vite frontend served by a FastAPI runtime. The
backend provides the OpenAI-backed chat, SQLite persistence, read-only admin
views, health checks, and Alembic migrations.

## Local development

```bash
npm install
npm run build
python -m venv .venv
.venv\Scripts\python -m pip install -r backend\requirements-dev.txt
.venv\Scripts\python -m alembic -c backend\alembic.ini upgrade head
npm run backend
```

For frontend-only work:

```bash
npm run dev
```

Open `http://localhost:5173`.

For the FastAPI runtime, open `http://127.0.0.1:8000` after `npm run backend`.

## Validation

```bash
npm run lint
npm test
npm run test:backend
npm run test:vertical
```

The validation commands create the production build, verify the SPA routes,
exercise backend contracts, apply Alembic migrations in a temporary database,
and test the FastAPI vertical path with SQLite persistence.

## Form email activation

The forms already use Python's standard SMTP stack, so no extra email library is required.

To activate live sending, configure these environment variables in `.env`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_SENDER_EMAIL`
- `SMTP_SENDER_NAME`
- `SMTP_REPLY_TO` (optional)
- `FORMS_NOTIFICATION_EMAIL`

For Mailjet SMTP, the typical base is:

- `SMTP_HOST=in-v3.mailjet.com`
- `SMTP_PORT=587`
- `SMTP_USE_STARTTLS=true`
- `SMTP_USE_SSL=false`

The current form protection strategy is intentionally lightweight:

- hidden honeypot field
- minimum form fill time
- session expiration for stale forms
- rate limiting per IP and per form route

This keeps the UX clean while stopping a large share of low-quality automated spam, but it does not eliminate targeted or manual abuse completely.

## Deployment

This repository is aligned with the `deploy-full` flow as the default deployment method.

- The current app is a single FastAPI HTTP runtime on internal port `8000`.
- `Dockerfile.deploy` builds the Vite frontend, installs the Python runtime, runs
  Alembic on startup, and serves `dist/` through FastAPI.
- SQLite data is expected under `/app/data`.
- The canonical deploy proposal lives in the local `deploy.env` file.
- Public deployment still requires the later deploy gate and Traefik protection
  for `/adm` and `/api/admin/*`.
