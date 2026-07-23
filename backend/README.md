# CriativAI Backend

FastAPI runtime for the CriativAI site, chat, persistence, admin read-only
views, and production candidate container.

It currently provides:

- FastAPI can serve the Vite `dist/` frontend.
- `/api/*` routes are not captured by the SPA fallback.
- `/api/health` can check the SQLite connection and frontend build.
- `/api/chat` streams NDJSON from the OpenAI-backed chat service.
- `/api/admin/*` exposes read-only conversation views for the future protected admin.
- Alembic can create and upgrade the SQLite schema.

Local flow:

```bash
npm run build
python -m venv .venv
.venv\Scripts\python -m pip install -r backend\requirements.txt
.venv\Scripts\python -m alembic -c backend\alembic.ini upgrade head
.venv\Scripts\python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Production candidate:

```bash
docker build -f Dockerfile.deploy -t criativai-runtime-candidate .
docker run --rm -p 8000:8000 -v criativai-data:/app/data --env-file .env criativai-runtime-candidate
```
