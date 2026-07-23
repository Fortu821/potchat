// src/components/ReportButton.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const REPORT_REASONS = [
  { value: 'spam', label: '📧 Spam' },
  { value: 'harassment', label: '😤 Molestie' },
  { value: 'hate_speech', label: '🚫 Discorso d\'odio' },
  { value: 'inappropriate_content', label: '🔞 Contenuto inappropriato' },
  { value: 'misinformation', label: '📰 Disinformazione' },
  { value: 'not_plant', label: '🌱 Non è una pianta' },
  { value: 'other', label: '📌 Altro' },
]

export default function ReportButton({ targetType, targetId, onReported }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReported, setIsReported] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) {
      alert('Devi essere loggato per segnalare')
      return
    }
    if (!reason) {
      alert('Seleziona un motivo')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          target_type: targetType,
          target_id: targetId,
          reason: reason,
          description: description.trim() || null
        })

      if (error) throw error

      setIsReported(true)
      setIsOpen(false)
      setReason('')
      setDescription('')
      if (onReported) onReported()

    } catch (err) {
      console.error('❌ Errore segnalazione:', err)
      if (err.code === '23505') {
        setError('Hai già segnalato questo contenuto')
      } else {
        setError('Errore durante la segnalazione')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isReported) {
    return (
      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        ✅ Segnalato
      </span>
    )
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="post-action"
        title="Segnala contenuto"
      >
        🚩
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            width: '300px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            marginBottom: '8px'
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '0.9rem' }}>🚩 Segnala contenuto</strong>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                Motivo *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input"
                style={{ fontSize: '0.85rem' }}
                required
              >
                <option value="">Seleziona...</option>
                {REPORT_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                Descrizione (opzionale)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Spiega brevemente..."
                rows={3}
                className="input"
                style={{ fontSize: '0.85rem', resize: 'vertical', minHeight: '60px' }}
              />
            </div>

            {error && (
              <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginBottom: '8px' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className="btn btn-danger"
              style={{ width: '100%' }}
            >
              {isSubmitting ? '⏳ Invio...' : '🚩 Invia segnalazione'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}