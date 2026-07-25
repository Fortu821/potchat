// supabase/functions/moderate-content/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// 🔐 LEGGE I WEBHOOK E LA SERVICE_ROLE_KEY DAI SECRETS
const DISCORD_WEBHOOK_BOT = Deno.env.get("DISCORD_WEBHOOK_BOT") || ""
const DISCORD_WEBHOOK_SEGNALAZIONI = Deno.env.get("DISCORD_WEBHOOK_SEGNALAZIONI") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

// 👇 BLACKLIST
const BLACKLIST = [
  "spam", "insulto", "minaccia", "violenza", "odio", "razzismo",
  "discriminazione", "molestia", "bullismo", "bestemmia", "porca",
  "dio cane", "dio porco", "maiale", "stronzo", "merda", "coglione",
  "testa di cazzo", "vaffanculo", "pezzo di merda",
  "omicidio", "stupro", "pedofilia", "pedopornografia", "zoofilia",
  "terrorismo", "bomba", "attentato", "hitler", "nazista", "mafia",
  "vincita", "premio", "clicca qui", "link sospetto", "offerta speciale",
  "nudo", "sesso", "porno", "hard", "link", "url", "phishing", "truffa", "scam",
  "frode", "furto", "hacker", "malware", "virus", "spyware", "ransomware", "trojan",
  "keylogger", "botnet", "ddos", "exploit", "vulnerabilità", "backdoor", "rootkit", "worm",
  "adware", "spammer", "scammer", "adulti", "sessuale", "pornografia", "erotico", "vincita",
  "vincerai", "potresti vincere"
]

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\sàèéìòù]/g, " ").replace(/\s+/g, " ").trim()
}

function containsBlacklistedWords(text: string): string[] {
  const normalized = normalizeText(text)
  const found: string[] = []
  for (const word of BLACKLIST) {
    if (normalized.includes(word)) {
      found.push(word)
    }
  }
  return found
}

async function saveReportToDatabase(payload: any) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ Supabase credentials mancanti, salto salvataggio report')
    return
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        reporter_id: payload.user_id,
        target_type: payload.type,
        target_id: payload.content_id,
        reason: 'moderation_bot',
        description: `Contenuto sospetto rilevato dal bot di moderazione. Parole trovate: ${payload.words.join(', ')}. Contenuto originale: ${payload.content}`,
        status: 'pending'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Errore salvataggio report:', errorText)
    } else {
      console.log(`✅ Report salvato nel database per ${payload.type} ${payload.content_id}`)
    }
  } catch (err) {
    console.error('❌ Errore durante il salvataggio del report:', err)
  }
}

// 📧 INVIO A DISCORD
async function sendToDiscord(webhookUrl: string, payload: any) {
  if (!webhookUrl) return
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🔍 **Nuova segnalazione**`,
      embeds: [{
        title: `⚠️ Contenuto sospetto (${payload.type})`,
        description: `**Contenuto:**\n${payload.content}`,
        fields: [
          { name: "ID", value: payload.content_id, inline: true },
          { name: "User ID", value: payload.user_id, inline: true },
          { name: "Parole trovate", value: payload.words.join(", "), inline: false },
        ],
        color: 0xFF0000,
        timestamp: new Date().toISOString(),
      }],
      username: "PotChat Mod Bot",
      avatar_url: "https://potchat.vercel.app/potchat_icon.svg",
    }),
  })
}

// ✅ CORS HEADERS
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
}

// 🧠 HANDLER PRINCIPALE
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }

  try {
    const body = await req.json()
    const { content_id, user_id, content, type } = body

    if (!content) {
      return new Response(JSON.stringify({ error: "Contenuto vuoto" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    const foundWords = containsBlacklistedWords(content)

    if (foundWords.length > 0) {
      const payload = { content_id, user_id, content, type, words: foundWords }

      // 1. Invia su Discord
      await sendToDiscord(DISCORD_WEBHOOK_BOT, payload)
      await sendToDiscord(DISCORD_WEBHOOK_SEGNALAZIONI, payload)
      console.log(`✅ Segnalazione inviata su Discord per ${type} ${content_id}`)

      // 2. Salva nel database (tabella reports)
      await saveReportToDatabase(payload)

    } else {
      console.log(`✅ Contenuto ${type} ${content_id} pulito`)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("❌ Errore:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }
})