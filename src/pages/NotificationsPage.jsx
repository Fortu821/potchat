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
    return (
      <div className="app-container text-center" style={{ paddingTop: '60px' }}>
        <div className="text-muted loading-pulse">⏳ Caricamento notifiche...</div>
      </div>
    )
  }

  // Formatta il messaggio in base al tipo
  function getNotificationMessage(notification) {
    const actor = notification.actor
    const actorName = actor?.display_name || actor?.username || 'Qualcuno'

    switch (notification.type) {
      case 'like':
        return `${actorName} ha messo like al tuo post`
      case 'comment':
        return `${actorName} ha commentato il tuo post`
      case 'repost':
        return `${actorName} ha repostato il tuo post`
      case 'follow':
        return `${actorName} ti ha seguito`
      case 'message':
        return `${actorName} ti ha inviato un messaggio`
      case 'report':
        return `${actorName} ha segnalato un contenuto`
      case 'achievement':
        return `${actorName} 🏆 ha sbloccato un nuovo trofeo!`
      default:
        return `${actorName} ha interagito con te`
    }
  }

  function getNotificationLink(notification) {
    const actor = notification.actor

    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'repost':
        return notification.post_id ? `/post/${notification.post_id}` : '#'
      case 'follow':
        return `/profile/${actor?.username}`
      case 'message':
        return notification.target_id ? `/chat/${notification.target_id}` : '/chats'
      case 'achievement':
        return `/profile/${actor?.username}`
      case 'report':
        return '#'
      default:
        return '#'
    }
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
          const isAchievement = n.type === 'achievement'
          const link = getNotificationLink(n)
          const message = getNotificationMessage(n)

          return (
            <Link
              key={n.id}
              to={link}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: n.read ? 'transparent' : 'var(--color-primary-bg)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 0.1s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'var(--color-primary-bg)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isAchievement ? (
                  <span style={{ fontSize: '1.8rem' }}>🏆</span>
                ) : actor?.avatar_url ? (
                  <img
                    src={actor.avatar_url}
                    alt={actorName}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    🌱
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div>
                    {isAchievement ? (
                      <>
                        <strong>{actorName}</strong>
                        <span style={{ marginLeft: '4px' }}>🏆 ha sbloccato un nuovo trofeo!</span>
                      </>
                    ) : (
                      <span>{message}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {new Date(n.created_at).toLocaleString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                    {!n.read && (
                      <span style={{ marginLeft: '8px', color: 'var(--color-secondary)', fontSize: '0.7rem' }}>
                        ● Nuovo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}