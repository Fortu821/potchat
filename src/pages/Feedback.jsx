// src/pages/Feedback.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Feedback() {
  const { user } = useAuth()
  const [type, setType] = useState('bug')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Invia via email (puoi usare un webhook o Supabase)
      const { error: supabaseError } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id || null,
          user_email: user?.email || 'anonimo',
          type: type,
          message: message.trim()
        })

      if (supabaseError) throw supabaseError

      // Invia anche una mail (opzionale, via Edge Function o webhook)
      // Per ora salviamo solo nel DB

      setSubmitted(true)
      setMessage('')
    } catch (err) {
      console.error('❌ Errore invio feedback:', err)
      setError('Errore nell\'invio del feedback. Prova a scriverci direttamente a potchat.social@proton.me')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="app-container" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌱</div>
        <h2>Grazie per il tuo feedback! 💚</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Il tuo messaggio ci aiuterà a migliorare PotChat.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
          ← Torna alla home
        </Link>
      </div>
    )
  }

  return (
    <div className="app-container" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>💬 Feedback</h2>
        <Link to="/" className="btn btn-secondary btn-sm">← Home</Link>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Segnala un bug, proponi una nuova funzionalità o dicci cosa ne pensi di PotChat.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Puoi anche scriverci direttamente a{' '}
          <a href="mailto:potchat.social@proton.me" style={{ color: 'var(--color-secondary)' }}>
            potchat.social@proton.me
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Tipo di feedback
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input"
          >
            <option value="bug">🐛 Bug / Errore</option>
            <option value="feature">✨ Nuova funzionalità</option>
            <option value="suggestion">💡 Suggerimento</option>
            <option value="feedback">📝 Feedback generale</option>
            <option value="other">📌 Altro</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Messaggio <span style={{ fontWeight: 'normal', color: 'var(--color-text-muted)' }}>(obbligatorio)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Scrivi qui il tuo feedback..."
            rows={5}
            className="textarea"
            required
          />
        </div>

        {error && (
          <p style={{ color: 'var(--color-danger)', fontSize: '0.9rem', marginBottom: '8px' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {isSubmitting ? '⏳ Invio in corso...' : '💬 Invia feedback'}
        </button>

        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '8px', textAlign: 'center' }}>
          Oppure invia un'email a{' '}
          <a href="mailto:potchat.social@proton.me" style={{ color: 'var(--color-secondary)' }}>
            potchat.social@proton.me
          </a>
        </p>
      </form>
    </div>
  )
}