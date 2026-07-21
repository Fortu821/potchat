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

        // Segna tutte come lette
        if (data && data.length > 0) {
          const unreadIds = data.filter(n => !n.read).map(n => n.id)
          if (unreadIds.length > 0) {
            await supabase
              .from('notifications')
              .update({ read: true })
              .in('id', unreadIds)
          }
        }

      } catch (err) {
        console.error('❌ Errore:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllNotifications()
  }, [user])

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Caricamento...</div>

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <Link to="/" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>🔔 Tutte le notifiche</h1>
      </div>

      {notifications.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>Nessuna notifica</p>
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
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: n.read ? 'transparent' : '#f0f7ff'
              }}
            >
              {actor?.avatar_url ? (
                <img
                  src={actor.avatar_url}
                  alt={actorName}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ccc' }} />
              )}
              <div>
                <Link to={`/profile/${actor?.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <strong>{actorName}</strong>
                </Link>
                <span style={{ marginLeft: '4px' }}>{message}</span>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
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