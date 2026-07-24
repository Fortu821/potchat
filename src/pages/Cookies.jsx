// src/pages/Cookies.jsx
import { Link } from 'react-router-dom'

export default function Cookies() {
  return (
    <div className="app-container" style={{ maxWidth: '720px', margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <Link to="/" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>🍪 Cookie Policy</h1>
      </div>

      <div className="card" style={{ padding: '24px', lineHeight: '1.7' }}>
        <p><strong>Ultimo aggiornamento:</strong> 24 Luglio 2026</p>

        <h3>1. Cosa sono i cookie</h3>
        <p>I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo per ricordare informazioni sulle tue preferenze e sessioni.</p>

        <h3>2. Quali cookie utilizziamo su PotChat</h3>
        <p>Utilizziamo <strong>solo cookie essenziali</strong>:</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Nome del cookie</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Scopo</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Scadenza</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}><code>sb-*</code></td>
              <td style={{ padding: '8px' }}>Gestione sessione di Supabase</td>
              <td style={{ padding: '8px' }}>Di sessione</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}><code>supabase-auth-token</code></td>
              <td style={{ padding: '8px' }}>Autenticazione utente</td>
              <td style={{ padding: '8px' }}>7 giorni (o fino al logout)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}><code>theme</code></td>
              <td style={{ padding: '8px' }}>Ricorda il tema scelto (chiaro/scuro)</td>
              <td style={{ padding: '8px' }}>365 giorni</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}><code>welcome_seen</code></td>
              <td style={{ padding: '8px' }}>Evita di mostrare il popup di benvenuto</td>
              <td style={{ padding: '8px' }}>365 giorni</td>
            </tr>
          </tbody>
        </table>

        <h3>3. Cookie di terze parti</h3>
        <p><strong>Non utilizziamo cookie di terze parti</strong> (pubblicità, analytics di terze parti, social media plugin). I dati di utilizzo anonimi vengono raccolti internamente per migliorare il servizio.</p>

        <h3>4. Come gestire i cookie</h3>
        <p>Puoi gestire o disabilitare i cookie dal tuo browser:</p>
        <ul>
          <li><strong>Chrome</strong>: Impostazioni → Privacy e sicurezza → Cookie e dati dei siti</li>
          <li><strong>Firefox</strong>: Opzioni → Privacy e sicurezza → Cookie e dati dei siti</li>
          <li><strong>Safari</strong>: Preferenze → Privacy → Gestisci dati dei siti web</li>
        </ul>
        <p><strong>Attenzione</strong>: disabilitare i cookie essenziali potrebbe impedire il corretto funzionamento di PotChat (ad esempio, il login potrebbe non funzionare).</p>

        <h3>5. Consenso ai cookie</h3>
        <p>Al tuo primo accesso a PotChat, ti verrà chiesto di accettare l'uso dei cookie essenziali. Il consenso può essere revocato in qualsiasi momento modificando le impostazioni del browser.</p>

        <h3>6. Modifiche alla Cookie Policy</h3>
        <ul>
          <li>PotChat può aggiornare questa policy in qualsiasi momento.</li>
          <li>Le modifiche saranno comunicate tramite notifica in-app o email.</li>
        </ul>

        <h3>7. Contatti</h3>
        <p>Per domande sui cookie o sulla privacy:</p>
        <p>📧 <a href="mailto:potchat.social@proton.me">potchat.social@proton.me</a></p>
      </div>
    </div>
  )
}