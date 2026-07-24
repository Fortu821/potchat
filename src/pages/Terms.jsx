// src/pages/Terms.jsx
import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="app-container" style={{ maxWidth: '720px', margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <Link to="/" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>🌱 Termini di Servizio</h1>
      </div>

      <div className="card" style={{ padding: '24px', lineHeight: '1.7' }}>
        <p><strong>Ultimo aggiornamento:</strong> 24 Luglio 2026</p>

        <h3>1. Benvenuto su PotChat</h3>
        <p>PotChat è un social network dove ogni utente interpreta il ruolo di una pianta. L'unica regola fondamentale è: <strong>sei una pianta</strong>. Una pianta intelligente, con la tecnologia.</p>
        <p>Accedendo o utilizzando PotChat, accetti di rispettare questi Termini di Servizio.</p>

        <h3>2. Chi può utilizzare PotChat</h3>
        <ul>
          <li>Puoi utilizzare PotChat se hai almeno <strong>14 anni</strong>.</li>
          <li>Devi registrarti con un account valido e fornire informazioni veritiere.</li>
          <li>Sei responsabile della sicurezza delle tue credenziali di accesso.</li>
        </ul>

        <h3>3. Cosa puoi fare su PotChat</h3>
        <ul>
          <li>Pubblicare contenuti (testi, immagini, video) dal punto di vista di una pianta.</li>
          <li>Interagire con altri utenti tramite like, commenti, repost e messaggi privati.</li>
          <li>Personalizzare il tuo profilo con il nome della tua pianta, il nome scientifico e la tua "posizione vegetale".</li>
          <li>Partecipare alla community nel rispetto delle regole.</li>
        </ul>

        <h3>4. Cosa non puoi fare</h3>
        <ul>
          <li><strong>Non puoi</strong> pubblicare contenuti illegali, offensivi, violenti, discriminatori o dannosi.</li>
          <li><strong>Non puoi</strong> impersonare altre persone o piante.</li>
          <li><strong>Non puoi</strong> utilizzare PotChat per attività fraudolente o spam.</li>
          <li><strong>Non puoi</strong> aggirare i sistemi di moderazione o blocco.</li>
          <li><strong>Non puoi</strong> raccogliere dati di altri utenti senza il loro consenso.</li>
          <li><strong>Non puoi</strong> utilizzare il social come "umano che parla di piante" — sei una pianta, ricordalo.</li>
          <li><strong>Non puoi bestemmiare</strong> o utilizzare linguaggio che offenda la sensibilità religiosa altrui.</li>
        </ul>
        <p>La violazione di queste regole può comportare la <strong>sospensione o l'eliminazione</strong> del tuo account.</p>

        <h3>5. Moderazione e segnalazioni</h3>
        <ul>
          <li>PotChat si riserva il diritto di rimuovere contenuti inappropriati.</li>
          <li>Gli utenti possono segnalare contenuti o profili che violano le regole.</li>
          <li>Le segnalazioni vengono esaminate dai moderatori, che possono applicare sanzioni (avviso, blocco temporaneo, bando permanente).</li>
          <li>L'utente bloccato riceverà un avviso.</li>
        </ul>

        <h3>6. Contenuti generati dagli utenti</h3>
        <ul>
          <li>I contenuti pubblicati su PotChat rimangono di proprietà dell'utente che li ha creati.</li>
          <li>Concedi a PotChat una licenza non esclusiva, mondiale e gratuita per mostrare, distribuire e promuovere i tuoi contenuti all'interno del social.</li>
          <li>Puoi modificare i tuoi contenuti in qualsiasi momento (la funzionalità è già disponibile). <strong>Non è possibile eliminare</strong> i contenuti pubblicati.</li>
        </ul>

        <h3>7. Cancellazione dell'account</h3>
        <ul>
          <li>Puoi eliminare il tuo account in qualsiasi momento dalla sezione profilo.</li>
          <li>La cancellazione è <strong>irreversibile</strong> e comporta la rimozione di tutti i tuoi dati (post, like, commenti, messaggi, ecc.).</li>
          <li>Prima di eliminare l'account, ti verrà chiesta una conferma.</li>
        </ul>

        <h3>8. Limitazioni di responsabilità</h3>
        <ul>
          <li>PotChat è fornito "così com'è", senza garanzie di disponibilità o assenza di errori.</li>
          <li>Non siamo responsabili per i contenuti pubblicati dagli utenti.</li>
          <li>Non siamo responsabili per eventuali danni derivanti dall'uso del servizio.</li>
        </ul>

        <h3>9. Modifiche ai Termini</h3>
        <ul>
          <li>PotChat può aggiornare questi Termini in qualsiasi momento.</li>
          <li>Ti avviseremo tramite notifica in-app o email per modifiche sostanziali.</li>
          <li>L'uso continuato del servizio dopo le modifiche costituisce accettazione.</li>
        </ul>

        <h3>10. Contatti</h3>
        <p>Per domande, segnalazioni o richieste di cancellazione dati:</p>
        <p>📧 <a href="mailto:potchat.social@proton.me">potchat.social@proton.me</a></p>
      </div>
    </div>
  )
}