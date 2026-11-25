# Careerly frontend

React + Vite frontend for the Careerly AI Resume Management & Career Assessment Platform.

## Requirements
- Node.js 18 or newer
- The Careerly Express backend running at `http://localhost:5000`

## Setup
```bash
npm install
```

Copy `.env.example` to `.env` and update `VITE_API_URL` if your backend uses a different address.

Start the frontend:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Expected backend API contract

All endpoints are prefixed by `VITE_API_URL` (default `/api`). Protected endpoints use `Authorization: Bearer <JWT>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register `{ name, email, password }` |
| POST | `/auth/login` | Login `{ email, password }`, return `{ token, user }` |
| GET | `/resumes` | List current user's resumes |
| POST | `/resumes/upload` | Multipart upload, field name `resume` |
| DELETE | `/resumes/:id` | Delete a resume |
| GET | `/resumes/:id/download` | Download a resume file |
| GET | `/jobs` | List current user's jobs |
| POST | `/jobs` | Create `{ title, company, description }` |
| DELETE | `/jobs/:id` | Delete a job |
| GET | `/assessments` | List current user's assessments |
| POST | `/assessments` | Create assessment `{ resumeId, jobId }` |
| PUT | `/users/profile` | Update `{ name, email }` |

The backend may use different endpoint names or response shapes. If so, update the matching `api` calls in the page files. The frontend's list helper accepts a plain array or common `{ data: [] }`, `{ items: [] }`, and `{ results: [] }` response shapes.

## Notes
- JWT is stored in localStorage for this learning project. For production, consider secure, httpOnly cookies and a suitable CSRF strategy.
- Frontend route protection is only a user-interface convenience. The backend must authenticate and authorize every protected endpoint.
- Never place MongoDB credentials, JWT secrets, or private AI provider keys in the frontend environment.
