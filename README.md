# CriativAI Landing Page

English landing page for CriativAI, presenting AI-powered products, intelligent automations, knowledge-grounded systems, services, and founder expertise.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm test
```

The validation command creates the production build and verifies the rendered page structure, core content, metadata, and accessibility markers.

## Deployment

This repository is aligned with the `deploy-full` flow as the default deployment method.

- The current app is still a static frontend, so it deploys with `DEPLOY_STRATEGY=static`.
- The canonical deploy state lives in the local `deploy.env` file.
- `deploy-static` is now treated as legacy during the transition to the unified deployment flow.
