// src/pages/SettingsContact.jsx
import { Link } from 'react-router-dom'

export default function SettingsContact() {
  return (
    <div className="app-container" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <Link to="/settings" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>📧 Contattaci</h1>
      </div>

      <div className="settings-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '3rem' }}>📧</div>
          <p style={{ fontSize: '1.1rem', marginTop: '8px' }}>
            Puoi scriverci per qualsiasi domanda, segnalazione o richiesta.
          </p>
        </div>

        <div style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            <strong>Email:</strong>{' '}
            <a href="mailto:potchat.social@proton.me" style={{ color: 'var(--color-primary)' }}>
              potchat.social@proton.me
            </a>
          </p>
        </div>

        <div style={{
          background: 'var(--color-primary-bg)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          borderLeft: '4px solid var(--color-primary)'
        }}>
          <p style={{ margin: 0 }}>
            ⏱️ Rispondiamo entro 48 ore (di solito molto prima).
          </p>
          <p style={{ margin: '4px 0 0 0' }}>
            🔒 Tutte le comunicazioni sono riservate.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <Link to="/settings/feedback" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
            📣 Vai al modulo di feedback
          </Link>
        </div>
      </div>
    </div>
  )
}