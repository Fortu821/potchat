// src/components/Achievements.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Achievements({ userId, isOwnProfile = false }) {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function fetchAchievements() {
      if (!userId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // 1. Prende tutti gli achievements
        const { data: allAchievements, error: aErr } = await supabase
          .from('achievements')
          .select('*')
          .order('condition_value', { ascending: true })

        if (aErr) throw aErr

        // 2. Prende quelli sbloccati dall'utente
        const { data: unlocked, error: uErr } = await supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', userId)

        if (uErr) throw uErr

        const unlockedIds = unlocked?.map(u => u.achievement_id) || []

        // 3. Prende le stats dell'utente (per mostrare progresso)
        const { data: userStats, error: sErr } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (sErr && sErr.code !== 'PGRST116') throw sErr

        // Arricchisce gli achievements
        const enriched = allAchievements.map(a => ({
          ...a,
          unlocked: unlockedIds.includes(a.id),
          unlocked_at: unlocked?.find(u => u.achievement_id === a.id)?.unlocked_at || null,
          progress: userStats ? Math.min(userStats[a.condition_type] || 0, a.condition_value) : 0,
          progress_max: a.condition_value
        }))

        setAchievements(enriched)
        setStats(userStats)
      } catch (err) {
        console.error('❌ Errore caricamento achievements:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [userId])

  if (loading) {
    return (
      <div className="text-muted" style={{ padding: '12px', textAlign: 'center', fontSize: '0.9rem' }}>
        ⏳ Caricamento trofei...
      </div>
    )
  }

  if (achievements.length === 0) {
    return <div className="text-muted" style={{ padding: '8px', fontSize: '0.9rem' }}>Nessun trofeo disponibile.</div>
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  const categoryLabels = {
    post: '📝 Post',
    interaction: '❤️ Interazioni',
    social: '👥 Social',
    streak: '📅 Costanza',
    special: '✨ Speciali'
  }

  const grouped = achievements.reduce((acc, a) => {
    const cat = a.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(a)
    return acc
  }, {})

  // Ordine delle categorie
  const categoryOrder = ['post', 'interaction', 'social', 'streak', 'special']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0 }}>🏆 Trofei</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {unlockedCount} / {totalCount} sbloccati
        </span>
        {isOwnProfile && (
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline btn-sm"
            style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '2px 12px' }}
          >
            ↻ Aggiorna
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {categoryOrder.map(cat => {
          if (!grouped[cat] || grouped[cat].length === 0) return null
          const items = grouped[cat]
          const unlockedInCat = items.filter(a => a.unlocked).length

          return (
            <div key={cat}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: 'var(--color-text-muted)',
                marginBottom: '4px'
              }}>
                <span>{categoryLabels[cat] || cat}</span>
                <span>{unlockedInCat}/{items.length}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {items.map(a => (
                  <div
                    key={a.id}
                    title={`${a.name}: ${a.description} ${a.unlocked ? '✅ Sbloccato!' : `(${a.progress}/${a.progress_max})`}`}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: a.unlocked ? 'var(--color-primary-bg)' : 'var(--color-border)',
                      border: a.unlocked ? '2px solid var(--color-primary)' : '2px solid transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: a.unlocked ? '1.4rem' : '1.1rem',
                      opacity: a.unlocked ? 1 : 0.4,
                      filter: a.unlocked ? 'none' : 'grayscale(0.8)',
                      transition: 'all 0.2s',
                      cursor: 'default',
                      position: 'relative'
                    }}
                  >
                    <span>{a.icon}</span>
                    {a.unlocked && (
                      <span style={{
                        fontSize: '0.45rem',
                        color: 'var(--color-primary)',
                        fontWeight: 'bold',
                        lineHeight: 1,
                        position: 'absolute',
                        bottom: '2px',
                        right: '4px'
                      }}>
                        ✓
                      </span>
                    )}
                    {!a.unlocked && a.progress > 0 && (
                      <span style={{
                        fontSize: '0.45rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 'bold',
                        lineHeight: 1,
                        position: 'absolute',
                        bottom: '2px',
                        right: '4px'
                      }}>
                        {a.progress}/{a.progress_max}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}