// src/pages/ResetPassword.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  async function handleReset(e) {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      console.error('❌ Errore reset:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '0 20px' }}>
      <h2>🔐 Nuova password</h2>

      {success ? (
        <div>
          <p style={{ color: 'var(--color-success)' }}>
            ✅ Password aggiornata con successo!
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Reindirizzamento al login...
          </p>
        </div>
      ) : (
        <form onSubmit={handleReset}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            Inserisci la nuova password (almeno 6 caratteri).
          </p>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Nuova password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Inserisci la nuova password"
              className="input"
              required
              minLength="6"
            />
          </div>
          {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Aggiornamento...' : '💾 Imposta nuova password'}
          </button>
        </form>
      )}

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        <Link to="/login">← Torna al login</Link>
      </p>
    </div>
  )
}