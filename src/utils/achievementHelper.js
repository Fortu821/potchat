// src/utils/achievementHelper.js
import { supabase } from '../lib/supabase'

/**
 * Controlla se l'utente ha sbloccato nuovi achievements
 * @param {string} userId - ID dell'utente
 * @param {string} action - Azione appena eseguita (opzionale)
 * @returns {Promise<Array>} - Lista dei nuovi achievements sbloccati
 */
export async function checkAchievements(userId, action = null) {
  if (!userId) return []

  try {
    // 1. Prende gli achievements già sbloccati
    const { data: unlocked, error: uErr } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    if (uErr) throw uErr

    const unlockedIds = unlocked?.map(u => u.achievement_id) || []

    // 2. Prende le stats dell'utente
    const { data: stats, error: sErr } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (sErr && sErr.code !== 'PGRST116') throw sErr

    // Se non ci sono stats, le crea
    if (!stats) {
      await supabase.rpc('update_user_stats', { user_id: userId })
      return []
    }

    // 3. Prende tutti gli achievements
    const { data: allAchievements, error: aErr } = await supabase
      .from('achievements')
      .select('*')

    if (aErr) throw aErr

    // 4. Filtra quelli da sbloccare
    const toUnlock = allAchievements.filter(a => {
      if (unlockedIds.includes(a.id)) return false
      // Controlla se la condizione è soddisfatta
      const currentValue = stats[a.condition_type] || 0
      return currentValue >= a.condition_value
    })

    // 5. Sblocca quelli nuovi
    const unlockedAchievements = []
    for (const achievement of toUnlock) {
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          notified: false
        })

      if (!insertError) {
        unlockedAchievements.push(achievement)

        // Push notification (se supportata)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🏆 Nuovo trofeo! ${achievement.icon} ${achievement.name}`, {
            body: achievement.description,
            icon: '/potchat_icon.svg'
          })
        }
      }
    }

    if (unlockedAchievements.length > 0) {
      console.log('🏆 Nuovi achievements sbloccati:', unlockedAchievements.map(a => a.name).join(', '))
    }

    return unlockedAchievements

  } catch (err) {
    console.error('❌ Errore controllo achievements:', err)
    return []
  }
}

/**
 * Inizializza le stats per un utente (se non esistono)
 */
export async function initializeUserStats(userId) {
  if (!userId) return

  try {
    const { data: existing, error: eErr } = await supabase
      .from('user_stats')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (eErr && eErr.code !== 'PGRST116') throw eErr

    if (!existing) {
      await supabase.rpc('update_user_stats', { user_id: userId })
    }
  } catch (err) {
    console.error('❌ Errore inizializzazione stats:', err)
  }
}