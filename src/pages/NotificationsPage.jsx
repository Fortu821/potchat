// src/pages/NotificationsPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllNotifications() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            actor:actor_id (
              username,
              display_name,
              avatar_url
            ),
            post:post_id (
              id,
              content
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setNotifications(data || [])

        const unreadIds = data?.filter(n => !n.read).map(n => n.id) || []
        if (unreadIds.length > 0) {
          await supabase
            .from('notifications')
            .update({ read: true })
            .in('id', unreadIds)
        }

      } catch (err) {
        console.error('❌ Errore:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllNotifications()
  }, [user])

  if (loading) {
    return <div className="app-container text-center" style={{ paddingTop: '60px' }}>
      <div className="text-muted loading-pulse">⏳ Caricamento notifiche...</div>
    </div>
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <Link to="/" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>🔔 Tutte le notifiche</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🔕</span>
          <h3>Nessuna notifica</h3>
          <p>Quando qualcuno interagirà con te, apparirà qui.</p>
        </div>
      ) : (
        notifications.map((n) => {
          const actor = n.actor
          const actorName = actor?.display_name || actor?.username || 'Qualcuno'

          let message = ''
          switch (n.type) {
            case 'like': message = 'ha messo like al tuo post'; break
            case 'comment': message = 'ha commentato il tuo post'; break
            case 'repost': message = 'ha repostato il tuo post'; break
            case 'follow': message = 'ti ha seguito'; break
            default: message = 'ha interagito con te'
          }

          return (
            <div
              key={n.id}
              className={`notification-item ${!n.read ? 'unread' : ''}`}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: n.read ? 'transparent' : 'var(--color-primary-bg)'
              }}
            >
              {actor?.avatar_url ? (
                <img
                  src={actor.avatar_url}
                  alt={actorName}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-border)' }} />
              )}
              <div>
                <Link to={`/profile/${actor?.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <strong>{actorName}</strong>
                </Link>
                <span style={{ marginLeft: '4px' }}>{message}</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {new Date(n.created_at).toLocaleString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}