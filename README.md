# 🌱 PotChat

**PotChat** è un social network tematico dove **ogni utente interpreta il ruolo di una pianta**.  
Il progetto è nato come esperimento educativo e divertente per imparare a costruire un'applicazione web full-stack, ed è cresciuto fino a diventare un social funzionante.

🔗 **Versione live:** [https://potchat.vercel.app](https://potchat.vercel.app)

---

## 📖 Il concept

> *"Sei una pianta. L'unica regola è questa. Ma ricorda: sei una pianta con la tecnologia, una pianta intelligente."*

Su PotChat non parli *di* piante. **Sei** la pianta.  
Puoi pubblicare pensieri dal punto di vista vegetale, interagire con altre piante, collezionare trofei e vivere l'esperienza di un social network con un tema originale.

---

## ✨ Funzionalità principali

### 👤 Autenticazione
- Registrazione, login, logout
- Reset password (via email)
- Protezione delle rotte

### 📝 Feed e post
- Pubblicazione di post con testo, immagini e video
- Filtri: più recenti, più popolari (24h), solo seguiti
- Like, repost e commenti nidificati (thread stile Reddit)
- Modifica dei propri post (solo contenuto)

### 👥 Profilo utente
- Modifica di bio, avatar, informazioni botaniche (nome comune, nome scientifico, posizione)
- Statistiche: post, follower, seguiti
- Visualizzazione follower / seguiti (con link ai profili)
- Upload avatar (con storage Supabase)

### 💬 Chat privata
- Messaggi in tempo reale (WebSocket)
- Lista conversazioni con badge per messaggi non letti
- Notifiche per nuovi messaggi

### 🔔 Notifiche
- Real-time (in-app + Web Notifications)
- Notifiche per: like, commenti, repost, follow, messaggi, achievement
- Campanella con badge e dropdown

### 🏆 Achievements (trofei)
- Oltre 15 traguardi sbloccabili (es. "Primo germoglio", "Popolare", "30 giorni di attività")
- Visualizzati nel profilo come badge
- Notifica quando un nuovo trofeo viene sbloccato

### 🛡️ Moderazione e sicurezza
- Segnalazione di post, commenti e profili (con motivo "Non è una pianta")
- Blocco utenti (intrusi)
- Nascondi post (solo per moderatori)
- Pannello di moderazione integrato (per admin/moderatori)

### ⚙️ Impostazioni e legale
- Pagina Impostazioni con cambio password e cancellazione account
- Termini di Servizio, Privacy Policy, Cookie Policy (testi completi)
- Documento legale scaricabile in formato `.txt`

### 🎨 UI/UX
- Tema chiaro / scuro (con toggle persistente)
- Layout responsive (mobile, tablet, desktop)
- Infinite scroll nel feed
- Animazioni fluide (like, notifiche, transizioni)

### 📧 Email
- Invio email di benvenuto automatico via Mailjet (Edge Function Supabase)
- Template HTML personalizzato

---

## 🛠️ Tecnologie utilizzate

| Area | Tecnologia |
|------|------------|
| **Frontend** | React 18, Vite, React Router |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **Email** | Mailjet (SMTP/API) |
| **Deploy** | Vercel (frontend) + Supabase Edge Functions |
| **Linguaggi** | JavaScript, JSX, SQL, PL/pgSQL |
| **Stili** | CSS custom (senza framework, design system proprietario) |

---

## 🚀 Installazione e setup locale

### 1. Clona il repository

```bash
git clone https://github.com/Fortu821/pianta-social.git
cd pianta-social
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Configura le variabili d'ambiente

Crea un file `.env` nella root del progetto con:

```env
VITE_SUPABASE_URL=https://il-tuo-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=la_tua_chiave_anon
```

> **Nota:** le chiavi le trovi su **Supabase Dashboard → Settings → API**.

### 4. Avvia il server di sviluppo

```bash
npm run dev
```

Il progetto sarà disponibile su `http://localhost:5173`.

---

## 🗄️ Setup del database

Il database è gestito da Supabase.  
Trovi tutti gli script SQL necessari nella sezione dedicata della documentazione.  
Le tabelle principali sono:

- `profiles` (utenti)
- `posts`, `likes`, `comments`, `reposts`
- `follows`
- `notifications`
- `conversations`, `messages`, `conversation_participants`
- `achievements`, `user_achievements`, `user_stats`
- `reports`, `feedback`
- `user_pins` (per i post fissati)

---

## 📁 Struttura del progetto (semplificata)

```
pianta-social/
├── public/                    # file statici (logo, favicon)
├── src/
│   ├── assets/                # immagini e SVG
│   ├── components/            # componenti riutilizzabili
│   │   ├── Achievements.jsx
│   │   ├── Comments.jsx
│   │   ├── Logo.jsx
│   │   ├── MediaUpload.jsx
│   │   ├── Notifications.jsx
│   │   ├── ReportButton.jsx
│   │   ├── SettingsButton.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── WelcomeModal.jsx
│   ├── context/
│   │   └── AuthContext.jsx    # gestione stato utente
│   ├── lib/
│   │   └── supabase.js        # client Supabase
│   ├── pages/
│   │   ├── Home.jsx           # feed principale
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   ├── SettingsPolicy.jsx # pagine policy (termine, privacy, cookie, legale)
│   │   ├── SettingsFeedback.jsx
│   │   ├── SettingsContact.jsx
│   │   ├── Login.jsx, Signup.jsx, ResetPassword.jsx
│   │   ├── NotificationsPage.jsx
│   │   ├── Chats.jsx, Chat.jsx
│   │   ├── Search.jsx
│   │   ├── Followers.jsx, Following.jsx
│   │   └── ...
│   ├── utils/
│   │   ├── textParser.js      # parsing di @menzioni e #hashtag
│   │   └── achievementHelper.js
│   ├── App.jsx
│   ├── index.css              # stili globali
│   └── main.jsx
├── supabase/                  # Edge Functions e migrazioni
│   └── functions/
│       └── send-welcome-email/
│           └── index.ts
├── .env.example
├── vercel.json
├── package.json
└── README.md
```

---

## 💬 Commenti nel codice

Essendo un progetto nato con finalità educative, il codice è **ampiamente commentato** in italiano.  
I commenti aiutano a:

- Capire il flusso di ogni componente
- Ricordare il motivo di determinate scelte
- Tracciare la logica di funzioni complesse (es. trigger SQL, RLS, WebSocket)

Se stai imparando, questo repository può essere un buon punto di partenza per vedere come si organizza un'applicazione React + Supabase dal vivo.

---

## 📦 Deploy

Il progetto è deployato su **Vercel** con integrazione continua da GitHub.  
Ogni push sul ramo `main` attiva automaticamente un nuovo deploy.

---

## 📧 Contatti

Per qualsiasi domanda, segnalazione o suggerimento:

📧 **potchat.social@proton.me**

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza **MIT** (libero uso, modifica e distribuzione).  
Vedi il file `LICENSE` per maggiori dettagli.

---

🌱 **Buona crescita!**

