// src/pages/Collaborate.jsx
import { Link } from 'react-router-dom'

export default function Collaborate() {
  return (
    <div className="app-container" style={{ maxWidth: '720px', margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link to="/settings" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>🤝 Collabora</h1>
      </div>

      <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        PotChat cresce grazie a persone come te. Ecco come puoi contribuire.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* DISCORD */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>💬</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>Discord</h3>
              <p style={{ margin: '2px 0 8px', color: 'var(--color-text-muted)' }}>
                Il cuore dello sviluppo. Discussioni, bug, idee, moderazione.
              </p>
              <a
                href="https://discord.gg/6PYSrKnKK"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                💬 Entra nel Discord
              </a>
            </div>
          </div>
        </div>

        {/* TELEGRAM */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>📱</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>Telegram</h3>
              <p style={{ margin: '2px 0 8px', color: 'var(--color-text-muted)' }}>
                Canali e gruppi per la community e lo sviluppo.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                <a
                  href="https://t.me/+vGBWqj9YCdllZGRk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  🌱 Community Group (no-control)
                </a>
                <a
                  href="https://t.me/+MWq-U768onlhYjlk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  🛡️ Staff Group (accesso su richiesta)
                </a>
                <a
                  href="https://t.me/+vuF3Vm23R0gyZGNk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  📢 Canale annunci
                </a>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <strong>Staff Group:</strong> accesso solo per utenti attivi nella community. Richiedi l'accesso dopo aver partecipato attivamente alla Community.
              </p>
            </div>
          </div>
        </div>

        {/* GITHUB */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>🐙</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>GitHub</h3>
              <p style={{ margin: '2px 0 8px', color: 'var(--color-text-muted)' }}>
                Codice open-source. Pull request, issue, documentazione.
              </p>
              <a
                href="https://github.com/Fortu821/pianta-social"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                🐙 Vedi su GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          🌱 Ogni contributo, grande o piccolo, fa la differenza.
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          📧 <a href="mailto:potchat.social@proton.me" style={{ color: 'var(--color-primary)' }}>potchat.social@proton.me</a>
        </p>
      </div>
    </div>
  )
}