---
name: DB Integration Patterns
description: How the frontend connects to PostgreSQL via the Express API and dbApi.ts
---

## Pattern
- `artifacts/sras-login/src/lib/dbApi.ts` — thin fetch client calling `/api/*` routes (no auth header, just Content-Type JSON). All methods return typed domain objects.
- Frontend dashboards add a `useEffect` at mount that calls `dbApi.*` methods, maps DB types to local UI types, and calls `setState`. Errors are caught and swallowed — the local INIT_* fallback data stays in place if the API is down.
- DB routes live in `artifacts/api-server/src/routes/` and are registered in `routes/index.ts`.

**Why:** The frontend uses Vite's path-based routing at `/` and the API is at `/api`; requests reach the API server at port 8080 through Replit's proxy.

**How to apply:** When adding new DB-backed data to a dashboard, import `dbApi` and add a `useEffect(() => { dbApi.getX().then(data => setState(mapped)).catch(()=>{}) }, [])` at the top of the component.
