import os
import json
import re

from google import genai
from google.genai import types

# Initialise the client once at module load (mirrors server/services/gemini.js)
_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Model name preserved exactly from server/services/gemini.js.
# Verified live against the Gemini API: models/gemini-3.6-flash is available
# and accepts generateContent requests with this API key.
MODEL_NAME = "gemini-3.6-flash"

# Suppress SDK advisory about automatic function calling in generate_content
_GENERATION_CONFIG = types.GenerateContentConfig(
    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
)

VALID_VERDICTS = {"Likely Reliable", "Questionable", "Likely Misleading"}


def analyze_article(article_text: str) -> dict:
    # Prompt preserved verbatim from server/services/gemini.js
    prompt = f"""You are a professional fact-checker and media analyst. Analyze the following article text for credibility.

Respond with ONLY a valid JSON object — no markdown, no code fences, no extra text before or after. The JSON must match this exact schema:

{{
  "verdict": "Likely Reliable" | "Questionable" | "Likely Misleading",
  "confidence": <integer between 0 and 100>,
  "summary": "<neutral 2-3 sentence summary of what the article claims>",
  "redFlags": ["<specific red flag>", "<specific red flag>"]
}}

Rules:
- "verdict" must be exactly one of: "Likely Reliable", "Questionable", "Likely Misleading"
- "confidence" must be an integer from 0 to 100 reflecting how confident you are in the verdict
- "summary" must be a neutral 2-3 sentence summary of the article's claims, not an evaluation
- "redFlags" must be an array of strings, each describing a specific concern (e.g. missing sources, emotional language, implausible claims). Use an empty array [] if there are no red flags.

Article text:
\"\"\"
{article_text}
\"\"\""""

    response = _client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=_GENERATION_CONFIG,
    )
    raw = response.text.strip()

    # Strip accidental markdown code fences (mirrors Node service behaviour)
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini returned non-JSON response: {cleaned[:200]}")

    # Validate required fields (mirrors Node service validation exactly)
    if parsed.get("verdict") not in VALID_VERDICTS:
        raise ValueError(f"Invalid verdict value: \"{parsed.get('verdict')}\"")
    if not isinstance(parsed.get("confidence"), (int, float)):
        raise ValueError(f"Invalid confidence value: \"{parsed.get('confidence')}\"")
    if not isinstance(parsed.get("summary"), str):
        raise ValueError("Missing or invalid summary field")
    if not isinstance(parsed.get("redFlags"), list):
        raise ValueError("Missing or invalid redFlags field")

    return {
        "verdict":    parsed["verdict"],
        "confidence": round(float(parsed["confidence"])),
        "summary":    parsed["summary"],
        "redFlags":   parsed["redFlags"],
    }
