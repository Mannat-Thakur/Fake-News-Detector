import { useState } from 'react'
import './App.css'

const VERDICT_META = {
  'Likely Reliable':    { className: 'verdict--reliable',    label: '✔ Likely Reliable' },
  'Questionable':       { className: 'verdict--questionable', label: '⚠ Questionable' },
  'Likely Misleading':  { className: 'verdict--misleading',  label: '✘ Likely Misleading' },
}

export default function App() {
  const [articleText, setArticleText] = useState('')
  const [result, setResult]           = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!articleText.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleText }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`)
      }

      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const meta = result ? VERDICT_META[result.verdict] : null

  return (
    <div className="page">
      <header className="header">
        <h1 className="header__title">🔍 Fake News Detector</h1>
        <p className="header__subtitle">
          Paste any article text below and get an AI-powered credibility assessment.
        </p>
      </header>

      <main className="main">
        <form className="form" onSubmit={handleSubmit}>
          <label className="form__label" htmlFor="article-input">
            Article Text
          </label>
          <textarea
            id="article-input"
            className="form__textarea"
            placeholder="Paste the full article text here…"
            value={articleText}
            onChange={(e) => setArticleText(e.target.value)}
            rows={12}
            disabled={loading}
          />
          <button
            type="submit"
            className="form__button"
            disabled={loading || !articleText.trim()}
          >
            {loading ? 'Analyzing…' : 'Analyze Article'}
          </button>
        </form>

        {error && (
          <div className="error-box" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && meta && (
          <section className="results">
            <h2 className="results__heading">Analysis Results</h2>

            {/* Verdict + Confidence */}
            <div className="result-row">
              <div className={`verdict-badge ${meta.className}`}>
                {meta.label}
              </div>
              <div className="confidence">
                Confidence: <strong>{result.confidence}%</strong>
              </div>
            </div>

            {/* Summary */}
            <div className="result-card">
              <h3 className="result-card__title">Summary</h3>
              <p className="result-card__body">{result.summary}</p>
            </div>

            {/* Red Flags */}
            <div className="result-card">
              <h3 className="result-card__title">Red Flags</h3>
              {result.redFlags.length === 0 ? (
                <p className="result-card__body result-card__body--muted">
                  None detected.
                </p>
              ) : (
                <ul className="red-flags-list">
                  {result.redFlags.map((flag, i) => (
                    <li key={i} className="red-flags-list__item">
                      {flag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
