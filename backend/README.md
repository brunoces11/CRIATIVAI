# CriativAI Backend Vertical

Minimal FastAPI vertical slice for the future AI agent backend.

It currently proves:

- FastAPI can serve the Vite `dist/` frontend.
- `/api/*` routes are not captured by the SPA fallback.
- `/api/health` can check the SQLite connection and frontend build.
- `/api/chat` streams a fake NDJSON response and persists messages.
- Alembic can create the initial SQLite schema.

Local flow:

```bash
npm run build
python -m venv .venv
.venv\Scripts\python -m pip install -r backend\requirements.txt
.venv\Scripts\python -m alembic -c backend\alembic.ini upgrade head
.venv\Scripts\python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
