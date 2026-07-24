// src/pages/SettingsFeedback.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function SettingsFeedback() {
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
      const { error: supabaseError } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id || null,
          user_email: user?.email || 'anonimo',
          type: type,
          message: message.trim()
        })

      if (supabaseError) throw supabaseError

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
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📣</div>
        <h2>Grazie per il tuo feedback! 💚</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Il tuo messaggio ci aiuterà a migliorare PotChat.
        </p>
        <Link to="/settings" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          ← Torna alle impostazioni
        </Link>
      </div>
    )
  }

  return (
    <div className="app-container" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <Link to="/settings" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>📣 Feedback</h1>
      </div>

      <div className="settings-card">
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Segnala un bug, proponi una nuova funzionalità o dicci cosa ne pensi di PotChat.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="settings-form-group">
            <label>Tipo di feedback</label>
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

          <div className="settings-form-group">
            <label>Messaggio <span style={{ fontWeight: 'normal', color: 'var(--color-text-muted)' }}>(obbligatorio)</span></label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi qui il tuo feedback..."
              rows={5}
              className="textarea"
              required
            />
          </div>

          {error && <p className="settings-error">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {isSubmitting ? '⏳ Invio in corso...' : '📣 Invia feedback'}
          </button>
        </form>
      </div>
    </div>
  )
}