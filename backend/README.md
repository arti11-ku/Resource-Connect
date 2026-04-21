# SRAS Backend (FastAPI + MongoDB)

Smart Resource Allocation System — backend for the NGO / Volunteer / Reporter / Admin dashboards.

## Stack
- FastAPI + Uvicorn
- MongoDB (via Motor async driver)
- JWT auth (python-jose) + bcrypt password hashing
- Pydantic v2 schemas
- Local file uploads (served at `/uploads`)

## Project Layout
```
backend/
├── main.py              # FastAPI entrypoint
├── requirements.txt
├── .env.example
├── app/
│   ├── config.py        # Settings via env
│   ├── database.py      # Mongo connection
│   ├── auth/            # JWT + RBAC
│   ├── models/          # Mongo document factories
│   ├── schemas/         # Pydantic request/response
│   ├── routes/          # API routers
│   └── services/        # File upload, AI allocation
└── uploads/             # Local file storage
```

## Run Locally

1. Install Python 3.11+ and have a MongoDB instance available
   (local `mongod` or a free MongoDB Atlas cluster).

2. Setup
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate          # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env                # then edit values
   ```

3. Start
   ```bash
   uvicorn main:app --reload --port 8000
   ```

4. Open docs: http://localhost:8000/docs

## Environment Variables
| Var | Description |
|---|---|
| `MONGODB_URI` | Mongo connection string |
| `MONGODB_DB` | Database name (default `sras`) |
| `JWT_SECRET` | Secret for signing tokens |
| `JWT_ALGORITHM` | Default `HS256` |
| `JWT_EXPIRE_MINUTES` | Token lifetime |
| `UPLOAD_DIR` | Folder for uploaded files |
| `CORS_ORIGINS` | Comma-separated allowed origins |

## Deploy on Render
1. Push the `backend/` folder to a Git repo.
2. Create a **Web Service** on Render pointing at it.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add the env vars from `.env.example` (use a MongoDB Atlas URI for `MONGODB_URI`).

## API Overview

### Auth
- `POST /auth/signup` — create account, returns JWT
- `POST /auth/login` — returns JWT
- `GET /auth/profile` — current user

### Tasks (NGO + Volunteer)
- `POST /tasks/create` (NGO)
- `GET /tasks/ngo` (NGO)
- `PUT /tasks/update/{task_id}` (NGO)
- `GET /tasks/available` (Volunteer)
- `POST /tasks/accept/{task_id}` (Volunteer)
- `PUT /tasks/status/{task_id}` (Volunteer)
- `GET /tasks/{task_id}`

### Issues (Reporter)
- `POST /issues/report` — multipart: `description`, `location`, optional `image`
- `GET /issues`
- `POST /issues/convert-to-task/{issue_id}` (NGO/Admin)

### Proofs (Volunteer)
- `POST /proof/upload` — multipart: `task_id`, `file`, optional `note`

### Admin
- `GET /admin/users`
- `GET /admin/tasks`
- `GET /admin/proofs`
- `PUT /admin/verify-proof/{proof_id}` — body `{ "status": "approved" | "rejected" }`
- `PUT /admin/flag/{id}` — toggle flag on user/task/issue

### AI Allocation
- `POST /ai/auto-assign/{task_id}` (NGO/Admin) — picks the best volunteer

### Analytics
- `GET /analytics/summary`

## Auth Usage
Send the JWT in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Frontend Integration
In your frontend, set the API base URL to your Render URL (or `http://localhost:8000` locally), store the `access_token` returned from `/auth/login` or `/auth/signup`, and attach it to subsequent requests.
