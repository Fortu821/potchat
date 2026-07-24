// src/pages/SettingsPolicy.jsx
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'

const policyData = {
  terms: {
    title: '📜 Termini di Servizio',
    file: 'potchat_terms.txt',
    content: `🌱 PotChat — Termini di Servizio (ToS)

Ultimo aggiornamento: 24 Luglio 2026

---

1. Benvenuto su PotChat
PotChat è un social network dove ogni utente interpreta il ruolo di una pianta.
L'unica regola fondamentale è: sei una pianta. Una pianta intelligente, con la tecnologia.

Accedendo o utilizzando PotChat, accetti di rispettare questi Termini di Servizio.

---

2. Chi può utilizzare PotChat
- Puoi utilizzare PotChat se hai almeno 14 anni.
- Devi registrarti con un account valido e fornire informazioni veritiere.
- Sei responsabile della sicurezza delle tue credenziali di accesso.

---

3. Cosa puoi fare su PotChat
- Pubblicare contenuti (testi, immagini, video) dal punto di vista di una pianta.
- Interagire con altri utenti tramite like, commenti, repost e messaggi privati.
- Personalizzare il tuo profilo con il nome della tua pianta, il nome scientifico e la tua "posizione vegetale".
- Partecipare alla community nel rispetto delle regole.

---

4. Cosa non puoi fare
- Non puoi pubblicare contenuti illegali, offensivi, violenti, discriminatori o dannosi.
- Non puoi impersonare altre persone o piante.
- Non puoi utilizzare PotChat per attività fraudolente o spam.
- Non puoi aggirare i sistemi di moderazione o blocco.
- Non puoi raccogliere dati di altri utenti senza il loro consenso.
- Non puoi utilizzare il social come "umano che parla di piante" — sei una pianta, ricordalo.
- Non puoi bestemmiare o utilizzare linguaggio che offenda la sensibilità religiosa altrui.

La violazione di queste regole può comportare la sospensione o l'eliminazione del tuo account.

---

5. Moderazione e segnalazioni
- PotChat si riserva il diritto di rimuovere contenuti inappropriati.
- Gli utenti possono segnalare contenuti o profili che violano le regole.
- Le segnalazioni vengono esaminate dai moderatori, che possono applicare sanzioni (avviso, blocco temporaneo, bando permanente).
- L'utente bloccato riceverà un avviso.

---

6. Contenuti generati dagli utenti
- I contenuti pubblicati su PotChat rimangono di proprietà dell'utente che li ha creati.
- Concedi a PotChat una licenza non esclusiva, mondiale e gratuita per mostrare, distribuire e promuovere i tuoi contenuti all'interno del social.
- Puoi modificare i tuoi contenuti in qualsiasi momento (la funzionalità è già disponibile). Non è possibile eliminare i contenuti pubblicati.

---

7. Cancellazione dell'account
- Puoi eliminare il tuo account in qualsiasi momento dalla sezione profilo.
- La cancellazione è irreversibile e comporta la rimozione di tutti i tuoi dati (post, like, commenti, messaggi, ecc.).
- Prima di eliminare l'account, ti verrà chiesta una conferma.

---

8. Limitazioni di responsabilità
- PotChat è fornito "così com'è", senza garanzie di disponibilità o assenza di errori.
- Non siamo responsabili per i contenuti pubblicati dagli utenti.
- Non siamo responsabili per eventuali danni derivanti dall'uso del servizio.

---

9. Modifiche ai Termini
- PotChat può aggiornare questi Termini in qualsiasi momento.
- Ti avviseremo tramite notifica in-app o email per modifiche sostanziali.
- L'uso continuato del servizio dopo le modifiche costituisce accettazione.

---

10. Contatti
Per domande, segnalazioni o richieste di cancellazione dati:

📧 potchat.social@proton.me`
  },
  privacy: {
    title: '🔒 Privacy Policy',
    file: 'potchat_privacy.txt',
    content: `🌱 PotChat — Privacy Policy

Ultimo aggiornamento: 24 Luglio 2026

---

1. Chi siamo
PotChat è un social network tematico gestito da un team indipendente.
La tua privacy è importante per noi. Questa policy spiega quali dati raccogliamo, come li usiamo e come puoi controllarli.

---

2. Quali dati raccogliamo

Dati forniti volontariamente:
- Email (necessaria per login e recupero password)
- Username e nome visualizzato
- Foto profilo (avatar)
- Bio e informazioni botaniche (nome comune, nome scientifico, posizione)

Dati generati dall'uso:
- Post, commenti, like, repost
- Messaggi privati (chat)
- Seguiti (follow/unfollow)
- Notifiche lette/non lette
- Segnalazioni effettuate

Dati tecnici:
- Indirizzo IP (anonimizzato)
- Tipo di browser e sistema operativo
- Data e ora delle attività
- Dispositivo utilizzato (desktop, mobile, ecc.)

---

3. Come utilizziamo i tuoi dati
- Per gestire il tuo account e il servizio.
- Per mostrare i tuoi contenuti ad altri utenti.
- Per inviarti notifiche e aggiornamenti (se lo desideri).
- Per moderare contenuti e garantire la sicurezza della community.
- Per migliorare PotChat (analytics, performance).
- Per inviarti eventuali email di benvenuto o comunicazioni di servizio.

---

4. Con chi condividiamo i tuoi dati
Non vendiamo, affittiamo o scambiamo i tuoi dati con terze parti.

Condividiamo i tuoi dati solo con:
- Supabase (hosting e autenticazione) — tutti i dati sono crittografati.
- Vercel (hosting del frontend).
- Mailjet (per l'invio di email, se attivo).

Ogni servizio è conforme al GDPR e adotta misure di sicurezza adeguate.

---

5. Dove vengono conservati i tuoi dati
I dati sono conservati su server Supabase situati in UE (o in regione conforme al GDPR).
La crittografia è attiva sia in transito che a riposo.

---

6. I tuoi diritti (GDPR / RGPD)
Hai il diritto di:
- Accedere ai tuoi dati in qualsiasi momento.
- Rettificare dati errati o incompleti.
- Cancellare il tuo account e tutti i dati associati.
- Limitare o opporti al trattamento dei dati.
- Richiedere una copia dei tuoi dati in formato portabile.
- Revocare il consenso per comunicazioni di marketing.

Per esercitare i tuoi diritti, scrivi a potchat.social@proton.me.

---

7. Quanto conserviamo i tuoi dati
- I tuoi dati vengono conservati finché il tuo account è attivo.
- Se elimini l'account, tutti i dati vengono rimossi in modo permanente entro 30 giorni.
- Dati anonimi (senza identificativi personali) possono essere conservati per statistiche.

---

8. Cookie e tecnologie simili
Utilizziamo solo cookie essenziali per il funzionamento del servizio.
Non utilizziamo cookie di terze parti per pubblicità o tracciamento.
Consulta la nostra Cookie Policy per maggiori dettagli.

---

9. Modifiche alla Privacy Policy
- PotChat può aggiornare questa policy in qualsiasi momento.
- Le modifiche saranno comunicate tramite notifica in-app o email.

---

10. Contatti
Per qualsiasi domanda sulla privacy o per richiedere l'esercizio dei tuoi diritti:

📧 potchat.social@proton.me`
  },
  cookies: {
    title: '🍪 Cookie Policy',
    file: 'potchat_cookies.txt',
    content: `🌱 PotChat — Cookie Policy

Ultimo aggiornamento: 24 Luglio 2026

---

1. Cosa sono i cookie
I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo per ricordare informazioni sulle tue preferenze e sessioni.

---

2. Quali cookie utilizziamo su PotChat

Utilizziamo solo cookie essenziali:

Nome del cookie     | Scopo                              | Scadenza
------------------- | ---------------------------------- | -----------
sb-*                | Gestione sessione di Supabase      | Di sessione
supabase-auth-token | Autenticazione utente              | 7 giorni (o fino al logout)
theme               | Ricorda il tema scelto (chiaro/scuro) | 365 giorni
welcome_seen        | Evita di mostrare il popup di benvenuto | 365 giorni

---

3. Cookie di terze parti
Non utilizziamo cookie di terze parti (pubblicità, analytics di terze parti, social media plugin).
I dati di utilizzo anonimi vengono raccolti internamente per migliorare il servizio.

---

4. Come gestire i cookie
Puoi gestire o disabilitare i cookie dal tuo browser:

- Chrome: Impostazioni → Privacy e sicurezza → Cookie e dati dei siti
- Firefox: Opzioni → Privacy e sicurezza → Cookie e dati dei siti
- Safari: Preferenze → Privacy → Gestisci dati dei siti web

Attenzione: disabilitare i cookie essenziali potrebbe impedire il corretto funzionamento di PotChat (ad esempio, il login potrebbe non funzionare).

---

5. Consenso ai cookie
Al tuo primo accesso a PotChat, ti verrà chiesto di accettare l'uso dei cookie essenziali.
Il consenso può essere revocato in qualsiasi momento modificando le impostazioni del browser.

---

6. Modifiche alla Cookie Policy
- PotChat può aggiornare questa policy in qualsiasi momento.
- Le modifiche saranno comunicate tramite notifica in-app o email.

---

7. Contatti
Per domande sui cookie o sulla privacy:

📧 potchat.social@proton.me

---

🌱 Grazie per aver letto le nostre policy. Ora torna a germogliare!`
  },
legal: {
  title: '📄 Documento Legale Completo',
  file: 'potchat_legal.txt',
  content: `📜 POTCHAT — DOCUMENTO LEGALE COMPLETO

Redatto in conformità con:
Regolamento Generale sulla Protezione dei Dati (GDPR - Reg. UE 2016/679)
Direttiva 2000/31/CE (Commercio Elettronico)
Legge 633/1941 (Diritto d'Autore)
Codice Civile Italiano (artt. 2043, 2050)

Data di entrata in vigore: 24 Luglio 2026
Data di ultima revisione: 24 Luglio 2026


1. DEFINIZIONI E PARTI CONTRAENTI

1.1. "PotChat" (di seguito "il Servizio", "la Piattaforma") è un social network tematico accessibile all'indirizzo web https://potchat.vercel.app e gestito da:
- Titolare del trattamento dei dati: PotChat Team
- Contatto: potchat.social@proton.me

1.2. "Utente" (di seguito "l'Utente", "l'Interessato") è qualsiasi persona fisica che accede, si registra o utilizza il Servizio.

1.3. "Contenuti" sono tutti i dati, testi, immagini, video, messaggi e informazioni pubblicati o scambiati attraverso il Servizio.

1.4. "Account" è il profilo personale dell'Utente, costituito da un nome utente, una password e dati associati.

1.5. "Pianta" è il ruolo interpretativo assunto da ogni Utente all'interno del Servizio. L'Utente agisce e interagisce esclusivamente come pianta.


2. ACCETTAZIONE E MODIFICHE DEI TERMINI

2.1. L'utilizzo del Servizio implica l'accettazione integrale e incondizionata del presente Documento Legale, nonché delle Policy ad esso collegate (Termini di Servizio, Privacy Policy, Cookie Policy).

2.2. PotChat si riserva il diritto di modificare unilateralmente il presente Documento in qualsiasi momento. Le modifiche saranno comunicate agli Utenti tramite notifica in-app e/o email. L'uso continuato del Servizio dopo la comunicazione costituisce accettazione tacita.


3. REGISTRAZIONE E IDONEITÀ

3.1. Per registrarsi su PotChat è necessario avere almeno 14 (quattordici) anni di età. In conformità con l'art. 8 del GDPR, il consenso al trattamento dei dati personali per i minori di 16 anni può essere prestato dai titolari della responsabilità genitoriale, ma PotChat richiede che l'Utente abbia almeno 14 anni e dichiari di avere l'autorizzazione dei genitori ove richiesta.

3.2. L'Utente si impegna a fornire informazioni veritiere e aggiornate. La creazione di account falsi, impersonificazioni o account multipli è vietata.

3.3. L'Utente è unico responsabile della custodia e riservatezza delle proprie credenziali di accesso. PotChat non risponde di accessi non autorizzati dovuti a negligenza dell'Utente.


4. CONDOTTA DELL'UTENTE

4.1. L'Utente si impegna a utilizzare il Servizio nel rispetto delle leggi vigenti, del presente Documento e delle norme di buona educazione digitale.

4.2. È espressamente vietato:
1. Pubblicare contenuti illegali, osceni, diffamatori, violenti, discriminatori, incitanti all'odio o che costituiscano reato (artt. 595, 604-bis, 610, 612-bis c.p.).
2. Pubblicare materiale pedopornografico, zoofilo, o che violi i diritti di terzi (immagine, onore, reputazione).
3. Diffondere virus, malware, spam o materiale dannoso.
4. Condurre attività di phishing, stalking, molestie o bullismo.
5. Bestemmiare o utilizzare linguaggio che offenda la sensibilità religiosa altrui. PotChat si riserva di rimuovere immediatamente tali contenuti e sospendere l'account.
6. Raccogliere o trattare dati personali di altri Utenti senza il loro esplicito consenso.
7. Utilizzare il Servizio per finalità commerciali o pubblicitarie senza autorizzazione scritta di PotChat.
8. Aggirare o tentare di aggirare le misure di sicurezza, moderazione o blocco.
9. Utilizzare il Servizio come "umano" anziché come "pianta", violando il tema fondante del social.

4.3. L'Utente è l'unico responsabile dei Contenuti pubblicati. PotChat non opera un controllo preventivo ma si riserva di rimuovere qualsiasi Contenuto che violi il presente Documento.


5. PROPRIETÀ INTELLETTUALE E LICENZA

5.1. I Contenuti generati dall'Utente restano di proprietà esclusiva dell'Utente stesso.

5.2. Con la pubblicazione su PotChat, l'Utente concede a PotChat una licenza non esclusiva, mondiale, gratuita e sub-licenziabile per:
- Riprodurre, distribuire, comunicare al pubblico, esporre e utilizzare i Contenuti ai fini del funzionamento e della promozione del Servizio.
- Conservare e archiviare i Contenuti su server sicuri.

5.3. La licenza rimane valida per tutta la durata dell'Account e termina con la cancellazione definitiva dell'Account, salvo che i Contenuti siano stati già condivisi da terzi.

5.4. L'Utente garantisce di detenere tutti i diritti necessari sui Contenuti pubblicati e di non violare diritti di terzi (diritto d'autore, marchi, breveti, diritto all'immagine, ecc.).


6. MODERAZIONE E SANZIONI

6.1. PotChat adotta un sistema di moderazione basato su segnalazioni degli Utenti e verifiche manuali.

6.2. Le violazioni del presente Documento possono comportare, a seconda della gravità:
1. Avviso (warning) con richiesta di rimozione del contenuto.
2. Rimozione del contenuto offensivo.
3. Sospensione temporanea dell'Account.
4. Blocco permanente dell'Account (bando).
5. Segnalazione alle autorità competenti in caso di reato.

6.3. L'Utente bloccato riceverà un avviso motivato. Le decisioni di blocco sono discrezionali e non appellabili, ma l'Utente può richiedere un riesame contattando potchat.social@proton.me.

6.4. La moderazione non è garanzia di assenza di Contenuti inappropriati. PotChat non risponde per Contenuti non rimossi tempestivamente.


7. TRATTAMENTO DATI PERSONALI

7.1. La raccolta, il trattamento e la conservazione dei dati personali avvengono nel rispetto del Regolamento UE 2016/679 (GDPR).

7.2. Base giuridica del trattamento:
- Esecuzione del contratto: gestione dell'Account e fornitura del Servizio.
- Consenso: per comunicazioni di marketing (se attivate).
- Interesse legittimo: per sicurezza, moderazione, miglioramento del Servizio.

7.3. Categorie di dati raccolti:
- Dati identificativi (email, username, nome).
- Dati di contatto (email).
- Dati di profilo (bio, avatar, informazioni botaniche).
- Dati di attività (post, commenti, like, chat, follow).
- Dati tecnici (IP, browser, dispositivo, timestamp).

7.4. Finalità del trattamento:
- Fornire, gestire e personalizzare il Servizio.
- Garantire sicurezza e moderazione.
- Analizzare tendenze e migliorare l'esperienza utente.
- Inviare comunicazioni di servizio e notifiche.

7.5. Conservazione: i dati sono conservati per tutta la durata dell'Account. Alla cancellazione dell'Account, i dati vengono rimossi entro 30 giorni, salvo obblighi legali (es. conservazione per reati).

7.6. Diritti dell'Interessato (artt. 15-22 GDPR):
- Diritto di accesso.
- Diritto di rettifica.
- Diritto di cancellazione ("diritto all'oblio").
- Diritto di limitazione del trattamento.
- Diritto alla portabilità dei dati.
- Diritto di opposizione.
- Diritto di revoca del consenso.
- Diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).

L'esercizio dei diritti può essere effettuato scrivendo a potchat.social@proton.me.

7.7. Trasferimento dei dati: i dati sono conservati su server Supabase, in UE. Non vi sono trasferimenti extra-UE.

7.8. Responsabile della protezione dei dati (DPO): non nominato in quanto il trattamento non è su larga scala. Per qualsiasi richiesta, contattare potchat.social@proton.me.


8. COOKIE E TECNOLOGIE DI TRACCIAMENTO

8.1. PotChat utilizza esclusivamente cookie tecnici essenziali:
- Cookie di autenticazione (sessione, refresh token).
- Cookie di preferenza (tema, welcome modal).

8.2. Non vengono utilizzati cookie di profilazione, pubblicità, marketing o tracciamento di terze parti.

8.3. L'Utente può disabilitare i cookie tramite le impostazioni del browser, ma ciò potrebbe compromettere il funzionamento del Servizio.


9. LIMITAZIONI DI RESPONSABILITÀ

9.1. PotChat è fornito "così com'è" (as is) e "come disponibile" (as available), senza garanzie esplicite o implicite di funzionalità, assenza di errori o disponibilità continua.

9.2. PotChat non è responsabile per:
- Contenuti pubblicati dagli Utenti.
- Danni diretti, indiretti, incidentali o consequenziali derivanti dall'uso del Servizio.
- Interruzioni, perdite di dati, attacchi informatici o malfunzionamenti di terze parti (Supabase, Vercel, servizi di hosting, ecc.).
- Uso improprio del Servizio da parte di terzi.

9.3. In ogni caso, la responsabilità di PotChat è limitata al massimo importo corrisposto dall'Utente per l'uso del Servizio (che, essendo gratuito, è pari a zero).


10. CANCELLAZIONE DELL'ACCOUNT

10.1. L'Utente può cancellare il proprio Account in qualsiasi momento tramite la funzione apposita nella sezione profilo.

10.2. La cancellazione è irreversibile e comporta la rimozione permanente di tutti i dati associati all'Account (profilo, post, commenti, like, chat, messaggi, segnalazioni, ecc.).

10.3. I dati conservati per obblighi legali (es. registri di moderazione) possono essere conservati in forma anonima.

10.4. Prima della cancellazione, l'Utente dovrà confermare l'operazione tramite un'azione esplicita (es. conferma via email o inserimento password).


11. MODIFICHE E TERMINAZIONE DEL SERVIZIO

11.1. PotChat può sospendere o terminare il Servizio in qualsiasi momento, con preavviso ragionevole.

11.2. PotChat può sospendere o chiudere Account in violazione del presente Documento, senza preavviso, nei casi di grave inosservanza.

11.3. In caso di cessazione del Servizio, gli Utenti saranno informati con almeno 30 giorni di anticipo.


12. LEGGE APPLICABILE E FORO COMPETENTE

12.1. Il presente Documento è regolato dalla legge italiana.

12.2. Per qualsiasi controversia relativa al Servizio, è competente in via esclusiva il Foro di Genova, fatto salvo il diritto del consumatore di adire il Foro del proprio luogo di residenza o domicilio ai sensi dell'art. 66-bis del Codice del Consumo.


13. CONTATTI E RICHIESTE

Per qualsiasi domanda, richiesta di chiarimento, esercizio dei diritti o segnalazione:

📧 potchat.social@proton.me
📬 Risposta garantita entro 30 giorni


🌱 Documento redatto il 24 Luglio 2026.
Conservare per riferimento futuro.`
}
}


export default function SettingsPolicy() {
  const { type } = useParams()
  const [downloading, setDownloading] = useState(false)
  const data = policyData[type]

  if (!data) {
    return (
      <div className="app-container" style={{ maxWidth: '720px', margin: '40px auto', textAlign: 'center' }}>
        <h2>404 - Pagina non trovata</h2>
        <Link to="/settings" className="btn btn-secondary">← Torna alle impostazioni</Link>
      </div>
    )
  }

  const handleDownload = () => {
    setDownloading(true)
    const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = data.file
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setDownloading(false)
  }

  return (
    <div className="app-container policy-page" style={{ maxWidth: '720px', margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <Link to="/settings" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>{data.title}</h1>
      </div>

      <div className="policy-card">
        <div className="policy-header">
          <span className="policy-badge">📄</span>
          <div>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Versione del 24 Luglio 2026
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn btn-primary policy-download-btn"
          >
            {downloading ? '⏳...' : '⬇️ Scarica .txt'}
          </button>
        </div>

        <div className="policy-content">
          {data.content.split('\n').map((line, index) => {
            if (line.startsWith('🌱') || line.startsWith('📜')) {
              return <h2 key={index} style={{ color: 'var(--color-primary)' }}>{line}</h2>
            }
            if (line.startsWith('Ultimo aggiornamento')) {
              return <p key={index} style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{line}</p>
            }
            if (line.match(/^\d+\./)) {
              return <h3 key={index}>{line}</h3>
            }
            if (line.startsWith('-')) {
              return <li key={index} style={{ marginLeft: '20px' }}>{line.slice(2)}</li>
            }
            if (line.trim() === '') {
              return <br key={index} />
            }
            if (line.startsWith('|')) {
              return <p key={index} style={{ fontFamily: 'monospace', whiteSpace: 'pre', fontSize: '0.85rem' }}>{line}</p>
            }
            return <p key={index} style={{ lineHeight: '1.7' }}>{line}</p>
          })}
        </div>
      </div>
    </div>
  )
}