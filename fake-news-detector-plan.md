# Fake News Detector — Build Plan

## Top-Level Overview

Build a MERN-style full-stack app (no database) called **Fake News Detector**.

- **Frontend**: React + Vite — a single page with a textarea, submit button, and results section.
- **Backend**: Node.js + Express — one POST endpoint `/analyze` that calls the Google Gemini API and returns a structured JSON verdict.
- **LLM Provider**: Google Gemini (`gemini-3.6-flash`) via `@google/generative-ai` SDK.
- **Constraints**: No database, no auth, no URL scraping. Text paste only. API key stored in `.env`.

---

## Planned File Structure

```
Fake-News-Detector/
├── client/                        # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── App.jsx                # Main page component
│   │   ├── App.css                # Page styles
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   ├── vite.config.js             # Proxy /analyze → backend
│   └── package.json
│
├── server/                        # Node/Express backend
│   ├── index.js                   # Express app entry, registers routes
│   ├── routes/
│   │   └── analyze.js             # POST /analyze route handler
│   ├── services/
│   │   └── gemini.js              # Gemini API call + response parsing
│   ├── .env                       # GEMINI_API_KEY (git-ignored)
│   ├── .env.example               # Template with placeholder key
│   └── package.json
│
├── .gitignore                     # Ignores node_modules, .env files
└── fake-news-detector-plan.md
```

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffolding & Configuration

**Intent**  
Create the monorepo folder structure, initialize both `client` and `server` packages, install dependencies, and wire up `.gitignore` and `.env` files. This is the foundation everything else builds on.

**Expected Outcomes**
- `client/` is a working Vite + React project (`npm run dev` serves the default page).
- `server/` is a Node/Express project with `@google/generative-ai` installed.
- `.gitignore` at the root excludes `node_modules` and `*.env` files.
- `server/.env.example` exists with a `GEMINI_API_KEY=` placeholder.
- Vite dev server proxies `/analyze` → `http://localhost:5000`.

**Todo List**
1. Create `Fake-News-Detector/.gitignore` — ignore `node_modules/`, `server/.env`, `*.env`.
2. Scaffold `client/` using Vite React template — generate `package.json`, `index.html`, `src/main.jsx`, `src/App.jsx`.
3. Scaffold `server/` — create `package.json` with `express`, `cors`, `dotenv`, `@google/generative-ai` dependencies.
4. Create `server/.env.example` with `GEMINI_API_KEY=your_key_here`.
5. Create `server/.env` (git-ignored) with a placeholder value so the server starts without crashing.
6. Add a Vite proxy in `client/vite.config.js` so `/analyze` forwards to `http://localhost:5000`.

**Relevant Context**
- All files are new; no existing code to reuse.
- Vite proxy config: `server.proxy['/analyze'] = 'http://localhost:5000'`

**Status**: [x] done

---

### Sub-Task 2 — Backend: Express Server + `/analyze` Endpoint

**Intent**  
Build the Express server with the single `POST /analyze` route. This route accepts `{ articleText }`, calls the Gemini service, and returns the exact JSON shape specified.

**Expected Outcomes**
- `server/index.js` starts an Express server on port 5000.
- `POST /analyze` with a valid body returns JSON matching:
  ```json
  {
    "verdict": "Likely Reliable" | "Questionable" | "Likely Misleading",
    "confidence": 0-100,
    "summary": "2-3 sentence neutral summary",
    "redFlags": ["...", "..."]
  }
  ```
- Missing or empty `articleText` returns a `400` error.
- The Gemini API key is read from `process.env.GEMINI_API_KEY`.

**Todo List**
1. Create `server/index.js` — initialize Express, attach `cors` and `express.json()` middleware, mount the analyze router, listen on port 5000.
2. Create `server/services/gemini.js` — build a Gemini prompt that instructs the model to return valid JSON only, call `gemini-1.5-flash`, parse the response, and return the structured object.
3. Create `server/routes/analyze.js` — validate `articleText` exists, call the Gemini service, return the result or a 500 on failure.

**Relevant Context**
- Use `@google/generative-ai` SDK: `new GoogleGenerativeAI(key)` → `.getGenerativeModel({ model: 'gemini-3.6-flash' })` → `.generateContent(prompt)`.
- The prompt must instruct Gemini to respond with **only** a JSON object (no markdown fences) matching the exact schema.
- Parse the text response with `JSON.parse()`; handle parse errors gracefully with a 500.

**Status**: [x] done

---

### Sub-Task 3 — Frontend: React UI

**Intent**  
Build the single-page React UI — textarea for input, submit button, and a results section that displays verdict, confidence, summary, and red flags with clear visual styling.

**Expected Outcomes**
- Page renders a textarea and a "Analyze" button.
- On submit, shows a loading state while awaiting the backend.
- On success, displays:
  - A color-coded verdict badge (green / yellow / red).
  - A confidence percentage as a plain number (e.g. "72%").
  - The neutral summary paragraph.
  - A list of red flags (or "None detected" if empty).
- On error (network or server), shows an inline error message.
- The UI is clean and usable without any external CSS framework.

**Todo List**
1. Replace `client/src/App.jsx` with the main page component — manage state for `articleText`, `result`, `loading`, and `error`.
2. Implement the `handleSubmit` function — POST to `/analyze`, set result state or error state.
3. Build the results section JSX — render verdict badge, confidence as a plain number percentage, summary, and red flags list conditionally.
4. Write `client/src/App.css` — minimal styles for layout and the verdict badge colors.

**Relevant Context**
- Vite proxy (set up in Sub-Task 1) means the fetch URL is just `/analyze` — no hardcoded host.
- Verdict color mapping: `"Likely Reliable"` → green, `"Questionable"` → amber/yellow, `"Likely Misleading"` → red.

**Status**: [x] done

---

### Sub-Task 4 — Final Wiring & Smoke Check

**Intent**  
Verify the full end-to-end flow works, ensure `.env` is git-ignored, and confirm the repo is in a clean, working state.

**Expected Outcomes**
- Running `node index.js` in `server/` and `npm run dev` in `client/` brings up the full app.
- Pasting article text and clicking Analyze returns a real verdict from Gemini.
- `git status` shows `.env` is not tracked.
- `server/.env.example` is committed as a setup guide.
- Root `.gitignore` is complete and correct.

**Todo List**
1. Verify `.gitignore` excludes `server/.env` and both `node_modules/` directories.
2. Confirm `server/.env.example` exists and is committed.
3. Do a final review pass — check for any hardcoded keys, missing `require`/`import` statements, or mismatched field names vs the specified JSON schema.

**Relevant Context**
- JSON schema field names are exact: `verdict`, `confidence`, `summary`, `redFlags` (camelCase).
- The three allowed verdict strings must match exactly (case-sensitive).

**Status**: [x] done
