// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  // Reset password
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetEmail) return

    setResetLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      setResetSent(true)
    } catch (err) {
      console.error('❌ Errore reset:', err)
      setError(err.message)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '0 20px' }}>
      <h2>🔐 Login</h2>

      {!showReset ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
            />
          </div>
          {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Caricamento...' : 'Accedi'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            Inserisci la tua email e ti invieremo un link per reimpostare la password.
          </p>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Inserisci la tua email"
              className="input"
              required
            />
          </div>
          {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
          {resetSent && (
            <p style={{ color: 'var(--color-success)' }}>
              ✅ Email inviata! Controlla la tua casella.
            </p>
          )}
          <button
            type="submit"
            disabled={resetLoading || resetSent}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {resetLoading ? '⏳ Invio...' : '📧 Invia link reset'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowReset(false)
              setError(null)
              setResetSent(false)
            }}
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '8px' }}
          >
            ← Torna al login
          </button>
        </form>
      )}

      {!showReset && !resetSent && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowReset(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-secondary)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            🔑 Password dimenticata?
          </button>
        </div>
      )}

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Non hai un account? <Link to="/signup">Registrati</Link>
      </p>
    </div>
  )
}