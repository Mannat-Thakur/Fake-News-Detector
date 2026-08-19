import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load .env before service imports so GEMINI_API_KEY is available
load_dotenv()

from services.gemini import analyze_article

app = Flask(__name__)
CORS(app)


@app.route("/analyze", methods=["POST"])
def analyze():
    body = request.get_json(force=True, silent=True) or {}
    article_text = body.get("articleText", "")

    if not article_text or not isinstance(article_text, str) or not article_text.strip():
        return jsonify({"error": "articleText is required and must be a non-empty string."}), 400

    try:
        result = analyze_article(article_text.strip())
        return jsonify(result), 200
    except Exception as e:
        print(f"Analysis error: {e}")
        return jsonify({"error": "Failed to analyze article. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
