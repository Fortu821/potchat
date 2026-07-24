// src/pages/Privacy.jsx
import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="app-container" style={{ maxWidth: '720px', margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <Link to="/" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>🔒 Privacy Policy</h1>
      </div>

      <div className="card" style={{ padding: '24px', lineHeight: '1.7' }}>
        <p><strong>Ultimo aggiornamento:</strong> 24 Luglio 2026</p>

        <h3>1. Chi siamo</h3>
        <p>PotChat è un social network tematico gestito da un team indipendente. La tua privacy è importante per noi. Questa policy spiega quali dati raccogliamo, come li usiamo e come puoi controllarli.</p>

        <h3>2. Quali dati raccogliamo</h3>
        <p><strong>Dati forniti volontariamente:</strong></p>
        <ul>
          <li>Email (necessaria per login e recupero password)</li>
          <li>Username e nome visualizzato</li>
          <li>Foto profilo (avatar)</li>
          <li>Bio e informazioni botaniche (nome comune, nome scientifico, posizione)</li>
        </ul>
        <p><strong>Dati generati dall'uso:</strong></p>
        <ul>
          <li>Post, commenti, like, repost</li>
          <li>Messaggi privati (chat)</li>
          <li>Seguiti (follow/unfollow)</li>
          <li>Notifiche lette/non lette</li>
          <li>Segnalazioni effettuate</li>
        </ul>
        <p><strong>Dati tecnici:</strong></p>
        <ul>
          <li>Indirizzo IP (anonimizzato)</li>
          <li>Tipo di browser e sistema operativo</li>
          <li>Data e ora delle attività</li>
          <li>Dispositivo utilizzato (desktop, mobile, ecc.)</li>
        </ul>

        <h3>3. Come utilizziamo i tuoi dati</h3>
        <ul>
          <li>Per gestire il tuo account e il servizio.</li>
          <li>Per mostrare i tuoi contenuti ad altri utenti.</li>
          <li>Per inviarti notifiche e aggiornamenti (se lo desideri).</li>
          <li>Per moderare contenuti e garantire la sicurezza della community.</li>
          <li>Per migliorare PotChat (analytics, performance).</li>
          <li>Per inviarti eventuali email di benvenuto o comunicazioni di servizio.</li>
        </ul>

        <h3>4. Con chi condividiamo i tuoi dati</h3>
        <p><strong>Non vendiamo, affittiamo o scambiamo i tuoi dati con terze parti.</strong></p>
        <p>Condividiamo i tuoi dati solo con:</p>
        <ul>
          <li><strong>Supabase</strong> (hosting e autenticazione) — tutti i dati sono crittografati.</li>
          <li><strong>Vercel</strong> (hosting del frontend).</li>
          <li><strong>Mailjet</strong> (per l'invio di email, se attivo).</li>
        </ul>
        <p>Ogni servizio è conforme al GDPR e adotta misure di sicurezza adeguate.</p>

        <h3>5. Dove vengono conservati i tuoi dati</h3>
        <p>I dati sono conservati su server <strong>Supabase</strong> situati in UE (o in regione conforme al GDPR). La crittografia è attiva sia in transito che a riposo.</p>

        <h3>6. I tuoi diritti (GDPR / RGPD)</h3>
        <p>Hai il diritto di:</p>
        <ul>
          <li><strong>Accedere</strong> ai tuoi dati in qualsiasi momento.</li>
          <li><strong>Rettificare</strong> dati errati o incompleti.</li>
          <li><strong>Cancellare</strong> il tuo account e tutti i dati associati.</li>
          <li><strong>Limitare</strong> o opporti al trattamento dei dati.</li>
          <li><strong>Richiedere</strong> una copia dei tuoi dati in formato portabile.</li>
          <li><strong>Revocare</strong> il consenso per comunicazioni di marketing.</li>
        </ul>
        <p>Per esercitare i tuoi diritti, scrivi a <a href="mailto:potchat.social@proton.me">potchat.social@proton.me</a>.</p>

        <h3>7. Quanto conserviamo i tuoi dati</h3>
        <ul>
          <li>I tuoi dati vengono conservati finché il tuo account è attivo.</li>
          <li>Se elimini l'account, tutti i dati vengono rimossi in modo permanente entro 30 giorni.</li>
          <li>Dati anonimi (senza identificativi personali) possono essere conservati per statistiche.</li>
        </ul>

        <h3>8. Cookie e tecnologie simili</h3>
        <p>Utilizziamo solo <strong>cookie essenziali</strong> per il funzionamento del servizio. Non utilizziamo cookie di terze parti per pubblicità o tracciamento. Consulta la nostra <Link to="/cookies">Cookie Policy</Link> per maggiori dettagli.</p>

        <h3>9. Modifiche alla Privacy Policy</h3>
        <ul>
          <li>PotChat può aggiornare questa policy in qualsiasi momento.</li>
          <li>Le modifiche saranno comunicate tramite notifica in-app o email.</li>
        </ul>

        <h3>10. Contatti</h3>
        <p>Per qualsiasi domanda sulla privacy o per richiedere l'esercizio dei tuoi diritti:</p>
        <p>📧 <a href="mailto:potchat.social@proton.me">potchat.social@proton.me</a></p>
      </div>
    </div>
  )
}