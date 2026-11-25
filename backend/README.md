# Careerly Backend

Express + MongoDB API designed to work with the Careerly React/Vite frontend.

## Requirements
- Node.js 18 or newer
- MongoDB Atlas account or local MongoDB

## Setup

1. Open a terminal in the `Careerly/backend` folder.
2. Install packages:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`.
   - Windows PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`

4. Edit `.env` and provide your MongoDB connection string and a long random JWT secret.
5. Start the API:

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:5000`. Test `http://localhost:5000/api/health`.

## Frontend configuration

In `Careerly/frontend/.env`, set:

```env
VITE_API_URL=http://localhost:5000/api
```

Restart the Vite server after changing `.env`.

## API routes

All routes except register, login, and health require:

`Authorization: Bearer YOUR_JWT_TOKEN`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/resumes` | List the signed-in user's resumes |
| POST | `/api/resumes/upload` | Upload PDF/DOCX; multipart field must be `resume` |
| GET | `/api/resumes/:id/download` | Download a resume |
| DELETE | `/api/resumes/:id` | Delete a resume |
| GET | `/api/jobs` | List jobs |
| POST | `/api/jobs` | Add a job |
| DELETE | `/api/jobs/:id` | Delete a job |
| GET | `/api/assessments` | List assessment history |
| POST | `/api/assessments` | Assess `{ "resumeId": "...", "jobId": "..." }` |
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update `{ "name", "headline", "location" }` |

## Gemini-powered assessment

Career assessments call Gemini through the current Interactions API using the official `@google/genai` JavaScript SDK. Set `GEMINI_API_KEY` in `.env`. `GEMINI_MODEL` is optional and defaults to `gemini-3.8-flash`. The backend sends extracted resume text and the selected job description to Gemini and requests structured JSON feedback, including a match estimate, ATS heuristic estimate, matched/missing skills, strengths, weaknesses, recommendations, related roles, and interview questions. The request sets `store: false` so the interaction is not retained as a stored Interactions resource. Scores are estimates, not hiring predictions. The existing keyword matcher is used only as a baseline when Gemini omits skill arrays.

## Upload limits and privacy

- PDF and DOCX only; maximum file size is 5 MB.
- Files are stored in the backend `uploads/` directory.
- This starter does not include cloud file storage, virus scanning, rate limiting, email verification, password reset, or production deployment hardening.
- Never commit `.env`, expose your MongoDB password, or put private AI API keys in the frontend.


## Gemini environment variables

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```


The Gemini integration uses the Interactions API and JSON structured output. See the official [Interactions API guide](https://aistudio.google.com/docs/interactions-overview) and [structured outputs guide](https://aistudio.google.com/docs/structured-output).


## Gemini + OpenAI provider fallback

Career assessments try providers in this order:

1. Gemini (primary)
2. OpenAI (secondary, if Gemini errors or is unavailable)
3. Local keyword matching (if both AI providers fail or are not configured)

Add both keys to `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.4-mini
```

Install dependencies with `npm install`, then restart the backend with `npm run dev`.
The assessment response and MongoDB record include `aiProvider`: `gemini`, `openai`,
or `keyword_fallback`.

OpenAI API usage is billed separately from a ChatGPT subscription. Check API billing and
model pricing before use. Never put either API key in frontend code or commit `.env`.
