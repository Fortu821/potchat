// src/components/SettingsButton.jsx
import { Link } from 'react-router-dom'

export default function SettingsButton() {
  return (
    <Link
      to="/settings"
      className="settings-button"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        fontSize: '1.3rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      ⚙️
    </Link>
  )
}