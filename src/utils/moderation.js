// src/utils/moderation.js
import { supabase } from '../lib/supabase'

export async function checkContent(content, type, contentId, userId) {
  try {
    // Usa l'anon key per chiamare la Edge Function
    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: {
        content_id: contentId,
        user_id: userId,
        content: content,
        type: type // 'post' o 'comment'
      }
    })

    if (error) {
      console.error('❌ Errore moderazione:', error)
    } else {
      console.log('✅ Moderazione completata:', data)
    }
  } catch (err) {
    console.error('❌ Errore chiamata moderazione:', err)
  }
}