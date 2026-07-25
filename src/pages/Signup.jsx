// src/pages/Signup.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  // 🔥 NUOVI STATI PER IL CONSENSO
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedAge, setAcceptedAge] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // ✅ Validazione consensi
    if (!acceptedTerms) {
      setError('Devi accettare la Privacy Policy e i Termini di Servizio per registrarti.')
      return
    }
    if (!acceptedAge) {
      setError('Devi confermare di avere almeno 14 anni o il consenso dei tuoi genitori.')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, username)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '0 20px' }}>
      <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Logo variant="full" />
      </div>

      <h2 style={{ textAlign: 'center' }}>🌱 Registrati</h2>

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
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

        {/* 🔥 CHECKBOX CONSENSO PRIVACY */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            style={{ marginTop: '3px', cursor: 'pointer' }}
          />
          <label htmlFor="terms" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
            Accetto la{' '}
            <Link to="/settings/privacy" target="_blank" style={{ color: 'var(--color-primary)' }}>
              Privacy Policy
            </Link>
            {' '}e i{' '}
            <Link to="/settings/terms" target="_blank" style={{ color: 'var(--color-primary)' }}>
              Termini di Servizio
            </Link>
            {' '}di PotChat.
          </label>
        </div>

        {/* 🔥 CHECKBOX ETÀ */}
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <input
            type="checkbox"
            id="age"
            checked={acceptedAge}
            onChange={(e) => setAcceptedAge(e.target.checked)}
            style={{ marginTop: '3px', cursor: 'pointer' }}
          />
          <label htmlFor="age" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
            Confermo di avere almeno <strong>14 anni</strong> o di avere il consenso dei miei genitori.
          </label>
        </div>

        {error && <p style={{ color: 'var(--color-danger)', marginBottom: '12px' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading || !acceptedTerms || !acceptedAge}
          className="btn btn-primary"
          style={{ width: '100%', opacity: (loading || !acceptedTerms || !acceptedAge) ? 0.6 : 1 }}
        >
          {loading ? '⏳ Caricamento...' : '🌱 Registrati'}
        </button>
      </form>

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Hai già un account? <Link to="/login">Accedi</Link>
      </p>
    </div>
  )
}