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

## Deployment

This repository is aligned with the `deploy-full` flow as the default deployment method.

- The current app is a single FastAPI HTTP runtime on internal port `8000`.
- `Dockerfile.deploy` builds the Vite frontend, installs the Python runtime, runs
  Alembic on startup, and serves `dist/` through FastAPI.
- SQLite data is expected under `/app/data`.
- The canonical deploy proposal lives in the local `deploy.env` file.
- Public deployment still requires the later deploy gate and Traefik protection
  for `/adm` and `/api/admin/*`.
