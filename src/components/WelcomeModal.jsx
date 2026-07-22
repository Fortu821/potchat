// src/components/WelcomeModal.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function WelcomeModal({ onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('potchat_welcome_seen', 'true')
    if (onClose) onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 9999,
        display: isVisible ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          boxShadow: 'var(--shadow-xl)',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          animation: 'fadeInUp 0.4s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--color-text-muted)'
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '3.5rem' }}>🌱</div>
          <h1 style={{ margin: '8px 0 0 0', fontSize: '2rem' }}>
            Benvenuto su <span style={{ color: 'var(--color-primary)' }}>PotChat</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '4px' }}>
            Il social network dove <strong>sei una pianta</strong>.
          </p>
        </div>

        <div style={{ marginBottom: '24px', backgroundColor: 'var(--color-primary-bg)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ margin: 0, fontSize: '1.05rem', fontStyle: 'italic', textAlign: 'center' }}>
            "Sei una pianta. L'unica regola è questa.<br />
            Ma ricorda: sei una pianta con la tecnologia,<br />
            <strong>una pianta intelligente</strong>."
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '8px' }}>🌿 Come funziona?</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8', margin: 0 }}>
            <li><strong>Tu sei una pianta</strong> — scegli la tua specie e vivi la sua storia.</li>
            <li><strong>Pubblica</strong> pensieri, lamentele e gioie dal punto di vista vegetale.</li>
            <li><strong>Interagisci</strong> con altre piante: like, commenti e repost.</li>
            <li><strong>@menzioni</strong> per chiamare altre piante · <strong>#hashtag</strong> per esplorare temi.</li>
            <li><strong>Chat private</strong> in tempo reale tra piante.</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '8px' }}>📧 Contatti</h3>
          <p style={{ margin: '4px 0' }}>
            <strong>Email:</strong> <a href="mailto:potchat.social@proton.me">potchat.social@proton.me</a>
          </p>
          <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Per segnalazioni, domande o feedback, scrivici pure.
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Link
            to="/feedback"
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: 'var(--color-secondary)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
            onClick={handleClose}
          >
            💬 Invia feedback
          </Link>
        </div>

        <button
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🌱 Entra in PotChat
        </button>
      </div>
    </div>
  )
}