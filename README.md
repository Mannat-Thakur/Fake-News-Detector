# 🔍 Fake News Detector

An AI-powered tool that helps students assess the credibility of news articles. Paste any article text and get an instant analysis: a credibility verdict, confidence score, neutral summary, and the specific red flags the AI identified.

## Why This Exists

Misinformation spreads fast through online news and social media, and it's often hard to tell reliable reporting from misleading content — especially under time pressure. This tool gives a quick, AI-assisted first read on an article's credibility, backed by specific reasoning rather than a black-box score.

## Features

- **Credibility Verdict** — Likely Reliable / Questionable / Likely Misleading
- **Confidence Score** — how confident the AI is in its assessment
- **Neutral Summary** — a 2–3 sentence unbiased summary of the article
- **Red Flags** — specific signals the AI detected (e.g. emotional language, lack of sourcing, unverifiable claims)

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js, Express
- **AI**: Google Gemini API (`gemini-3.6-flash`)

## Screenshot

*(add a screenshot of the app here — drag an image into the GitHub README editor or reference `./screenshot.png`)*

## Getting Started

### Prerequisites
- Node.js installed
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Setup

1. Clone the repo
```bash
   git clone https://github.com/Mannat-Thakur/Fake-News-Detector.git
   cd Fake-News-Detector
```

2. Install dependencies
```bash
   cd client && npm install
   cd ../server && npm install
```

3. Add your API key
   - In `server/`, copy `.env.example` to `.env`
   - Add your Gemini API key:
   GEMINI_API_KEY=your_key_here

4. Run the app (two terminals)
```bash
   # Terminal 1 — backend
   cd server
   npx run index.js

   # Terminal 2 — frontend
   cd client
   npm run dev
```

5. Open `http://localhost:5173` in your browser

## Limitations

AI credibility scoring is a heuristic aid, not a fact-checking guarantee. Verdicts should be cross-checked against established fact-checking sources rather than relied on as a final judgment.

## Built With IBM Project Bob

This project was built as part of my IBM SkillsBuild internship, using IBM Project Bob as my AI development partner for planning and implementation.