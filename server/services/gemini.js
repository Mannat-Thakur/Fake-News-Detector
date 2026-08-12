const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeArticle(articleText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const prompt = `You are a professional fact-checker and media analyst. Analyze the following article text for credibility.

Respond with ONLY a valid JSON object — no markdown, no code fences, no extra text before or after. The JSON must match this exact schema:

{
  "verdict": "Likely Reliable" | "Questionable" | "Likely Misleading",
  "confidence": <integer between 0 and 100>,
  "summary": "<neutral 2-3 sentence summary of what the article claims>",
  "redFlags": ["<specific red flag>", "<specific red flag>"]
}

Rules:
- "verdict" must be exactly one of: "Likely Reliable", "Questionable", "Likely Misleading"
- "confidence" must be an integer from 0 to 100 reflecting how confident you are in the verdict
- "summary" must be a neutral 2-3 sentence summary of the article's claims, not an evaluation
- "redFlags" must be an array of strings, each describing a specific concern (e.g. missing sources, emotional language, implausible claims). Use an empty array [] if there are no red flags.

Article text:
"""
${articleText}
"""`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();

  // Strip accidental markdown code fences if the model includes them despite instructions
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini returned non-JSON response: ${cleaned.slice(0, 200)}`);
  }

  // Validate required fields
  const validVerdicts = ['Likely Reliable', 'Questionable', 'Likely Misleading'];
  if (!validVerdicts.includes(parsed.verdict)) {
    throw new Error(`Invalid verdict value: "${parsed.verdict}"`);
  }
  if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 100) {
    throw new Error(`Invalid confidence value: "${parsed.confidence}"`);
  }
  if (typeof parsed.summary !== 'string') {
    throw new Error('Missing or invalid summary field');
  }
  if (!Array.isArray(parsed.redFlags)) {
    throw new Error('Missing or invalid redFlags field');
  }

  return {
    verdict: parsed.verdict,
    confidence: Math.round(parsed.confidence),
    summary: parsed.summary,
    redFlags: parsed.redFlags,
  };
}

module.exports = { analyzeArticle };
