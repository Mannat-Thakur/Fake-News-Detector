const express = require('express');
const { analyzeArticle } = require('../services/gemini');

const router = express.Router();

router.post('/', async (req, res) => {
  const { articleText } = req.body;

  if (!articleText || typeof articleText !== 'string' || articleText.trim().length === 0) {
    return res.status(400).json({ error: 'articleText is required and must be a non-empty string.' });
  }

  try {
    const result = await analyzeArticle(articleText.trim());
    return res.status(200).json(result);
  } catch (err) {
    console.error('Analysis error:', err.message);
    return res.status(500).json({ error: 'Failed to analyze article. Please try again.' });
  }
});

module.exports = router;
