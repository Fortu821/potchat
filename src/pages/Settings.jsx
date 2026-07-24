// src/pages/Settings.jsx
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Settings() {  // 👈 DEVE ESSERCI QUESTO
  const { user, signOut } = useAuth()

  return (
    <div className="app-container" style={{ maxWidth: '560px', margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link to="/" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>⚙️ Impostazioni</h1>
      </div>

      {/* Sezione Account */}
      {user && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0 }}>👤 Account</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link
              to={`/profile/${user.username}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg)',
                textDecoration: 'none',
                color: 'var(--color-text)',
                transition: 'background 0.1s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
            >
              <span style={{ fontSize: '1.2rem' }}>👤</span>
              <span>Il mio profilo</span>
            </Link>
            <button
              onClick={signOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg)',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-danger)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                width: '100%',
                textAlign: 'left',
                transition: 'background 0.1s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
            >
              <span style={{ fontSize: '1.2rem' }}>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Sezione Legale */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <h3 style={{ marginTop: 0 }}>📜 Legale</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/terms"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              transition: 'background 0.1s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
          >
            <span style={{ fontSize: '1.2rem' }}>📜</span>
            <span>Termini di Servizio</span>
          </Link>
          <Link
            to="/privacy"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              transition: 'background 0.1s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
          >
            <span style={{ fontSize: '1.2rem' }}>🔒</span>
            <span>Privacy Policy</span>
          </Link>
          <Link
            to="/cookies"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              transition: 'background 0.1s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
          >
            <span style={{ fontSize: '1.2rem' }}>🍪</span>
            <span>Cookie Policy</span>
          </Link>
          <Link
            to="/legal"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              transition: 'background 0.1s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
          >
            <span style={{ fontSize: '1.2rem' }}>📄</span>
            <span>Documento legale completo</span>
          </Link>
        </div>
      </div>

      {/* Sezione Supporto */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <h3 style={{ marginTop: 0 }}>💬 Supporto</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/feedback"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              transition: 'background 0.1s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
          >
            <span style={{ fontSize: '1.2rem' }}>📣</span>
            <span>Invia feedback</span>
          </Link>
          <a
            href="mailto:potchat.social@proton.me"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              transition: 'background 0.1s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
          >
            <span style={{ fontSize: '1.2rem' }}>📧</span>
            <span>Contattaci</span>
          </a>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        🌱 PotChat v1.0 • {new Date().getFullYear()}
      </div>
    </div>
  )
}