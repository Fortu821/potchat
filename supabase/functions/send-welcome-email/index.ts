import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY") || ""
const MAILJET_API_SECRET = Deno.env.get("MAILJET_API_SECRET") || ""
const MAILJET_FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL") || "noreply@mailjet.com"
const MAILJET_FROM_NAME = "PotChat"
const SITE_URL = Deno.env.get("SITE_URL") || "https://potchat.vercel.app"

function getWelcomeEmailHtml(username: string) {
  const displayName = username || "pianta intelligente"
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌱 Benvenuto su PotChat</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#f0f2f5;color:#1a1a2e;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
    <tr>
      <td style="padding:32px 24px;text-align:center;background-color:#2e7d32;">
        <img src="${SITE_URL}/potchat_name.svg" alt="PotChat" style="height:48px;width:auto;">
        <p style="color:#e8f5e9;font-size:1.1rem;margin:8px 0 0;">Il social network dove sei una pianta 🌱</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <h1 style="font-size:1.6rem;color:#2e7d32;margin:0 0 8px;">🌱 Benvenuto su PotChat!</h1>
        <p style="font-size:1rem;color:#5a5a7a;margin:0 0 20px;line-height:1.6;">
          Ciao ${displayName}! 👋
        </p>
        <p style="font-size:1rem;color:#1a1a2e;line-height:1.6;margin-bottom:16px;">
          Grazie per esserti unito a <strong>PotChat</strong>, il social network dove <strong>sei una pianta</strong>. 🌿
        </p>
        <p style="font-size:1rem;color:#1a1a2e;line-height:1.6;margin-bottom:16px;">
          Qui le foglie cadono, le radici crescono, e la luce del sole è un evento.<br>
          Non sei un umano che parla di piante.<br>
          <strong>Sei la pianta.</strong>
        </p>
        <div style="background-color:#f9f9f9;border-radius:12px;padding:20px;border-left:4px solid #2e7d32;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:1rem;font-weight:600;color:#1a1a2e;">🌿 Cosa fare ora?</p>
          <ul style="margin:8px 0 0;padding-left:20px;line-height:1.8;color:#1a1a2e;">
            <li><strong>1. Compila il tuo profilo</strong> — scegli il nome della tua pianta, il nome scientifico e dove vivi.</li>
            <li><strong>2. Pubblica il tuo primo post</strong> — racconta al mondo la tua giornata vegetale.</li>
            <li><strong>3. Interagisci con altre piante</strong> — like, commenti, repost e chat private.</li>
            <li><strong>4. Colleziona trofei</strong> — ogni azione ti avvicina a un nuovo badge! 🏆</li>
          </ul>
        </div>
        <div style="background-color:#e8f5e9;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
          <p style="margin:0;font-size:1rem;color:#2e7d32;font-weight:600;">
            🌱 Il tuo primo obiettivo: pubblica il tuo primo post e sblocca il trofeo<br>
            <span style="font-size:1.5rem;">🌱 Primo germoglio</span>
          </p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${SITE_URL}" style="background-color:#2e7d32;color:white;padding:12px 32px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">
            🌱 Entra in PotChat
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;">
        <p style="font-size:0.9rem;color:#5a5a7a;text-align:center;margin:0;">
          📧 Per qualsiasi domanda: <a href="mailto:potchat.social@proton.me" style="color:#2e7d32;">potchat.social@proton.me</a>
        </p>
        <p style="font-size:0.8rem;color:#8888aa;text-align:center;margin:8px 0 0;">
          🔔 Per non ricevere più queste email, scrivici a potchat.social@proton.me
        </p>
        <p style="font-size:0.7rem;color:#aaa;text-align:center;margin:8px 0 0;">
          🌱 PotChat • 2026
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

async function sendEmailViaMailjet(toEmail: string, toName: string, subject: string, html: string) {
  const url = "https://api.mailjet.com/v3.1/send"
  const auth = btoa(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`)
  const payload = {
    Messages: [{
      From: { Email: MAILJET_FROM_EMAIL, Name: MAILJET_FROM_NAME },
      To: [{ Email: toEmail, Name: toName || "Pianta intelligente" }],
      Subject: subject,
      HTMLPart: html,
    }],
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw new Error(`Mailjet error: ${response.status} - ${await response.text()}`)
  return await response.json()
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 })

  try {
    const { user_id, email, username } = await req.json()
    if (!user_id || !email) throw new Error("Missing user_id or email")

    console.log(`📧 Invio email di benvenuto a ${email}...`)
    const result = await sendEmailViaMailjet(email, username || email.split("@")[0], "🌱 Benvenuto su PotChat!", getWelcomeEmailHtml(username))
    console.log(`✅ Email inviata a ${email}`)

    return new Response(JSON.stringify({ success: true, result }), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("❌ Errore:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
})
