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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
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
        {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%' }}
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