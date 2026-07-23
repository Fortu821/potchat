// src/components/Notifications.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  async function fetchNotifications() {
    if (!user) return

    setLoading(true)
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
        .limit(50)

      if (error) throw error
      setNotifications(data || [])
      
      const unread = data?.filter(n => !n.read).length || 0
      setUnreadCount(unread)

    } catch (err) {
      console.error('❌ Errore caricamento notifiche:', err)
    } finally {
      setLoading(false)
    }
  }

  async function markAllAsRead() {
    if (!user || unreadCount === 0) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error
      setUnreadCount(0)
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )

    } catch (err) {
      console.error('❌ Errore segna come lette:', err)
    }
  }

  async function markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))

    } catch (err) {
      console.error('❌ Errore segna come letta:', err)
    }
  }

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
      if (unreadCount > 0) {
        markAllAsRead()
      }
    }
  }

  useEffect(() => {
    if (!user) return

    fetchNotifications()

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      channel.unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [user])

  function renderNotification(notification) {
    const actor = notification.actor
    const actorName = actor?.display_name || actor?.username || 'Qualcuno'
    const actorLink = `/profile/${actor?.username}`

    const time = new Date(notification.created_at).toLocaleString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    })

    let message = ''
    let link = ''

    switch (notification.type) {
      case 'like':
        message = `ha messo like al tuo post`
        link = notification.post_id ? `/post/${notification.post_id}` : '#'
        break
      case 'comment':
        message = `ha commentato il tuo post`
        link = notification.post_id ? `/post/${notification.post_id}` : '#'
        break
      case 'repost':
        message = `ha repostato il tuo post`
        link = notification.post_id ? `/post/${notification.post_id}` : '#'
        break
      case 'follow':
        message = `ti ha seguito`
        link = actorLink
        break
      case 'message':
        message = `ti ha inviato un messaggio`
        link = notification.target_id ? `/chat/${notification.target_id}` : '#'
        break
      default:
        message = `ha interagito con te`
        link = '#'
    }

    return (
      <Link
        key={notification.id}
        to={link}
        onClick={() => markAsRead(notification.id)}
        style={{
          display: 'block',
          padding: '10px 12px',
          textDecoration: 'none',
          color: 'inherit',
          backgroundColor: notification.read ? 'transparent' : '#f0f7ff',
          borderBottom: '1px solid #eee',
          transition: 'background 0.1s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f5f5f5'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : '#f0f7ff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {actor?.avatar_url ? (
            <img
              src={actor.avatar_url}
              alt={actorName}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ccc' }} />
          )}
          <div style={{ flex: 1 }}>
            <div>
              <strong>{actorName}</strong>
              <span style={{ marginLeft: '4px' }}>{message}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>
              {time}
              {!notification.read && (
                <span style={{ marginLeft: '8px', color: '#3498db', fontSize: '0.7rem' }}>
                  ● Nuovo
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={toggleDropdown}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          position: 'relative',
          padding: '4px 8px'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#e74c3c',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              minWidth: '18px',
              textAlign: 'center'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '380px',
            maxHeight: '460px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid #ddd',
            overflow: 'hidden',
            zIndex: 1000
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              fontWeight: 'bold',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>🔔 Notifiche</span>
            {notifications.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#888' }}>
                {notifications.filter(n => !n.read).length} non lette
              </span>
            )}
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                ⏳ Caricamento...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#aaa' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔕</div>
                <p>Nessuna notifica</p>
                <p style={{ fontSize: '0.85rem' }}>
                  Quando qualcuno interagirà con te, apparirà qui.
                </p>
              </div>
            ) : (
              notifications.map(renderNotification)
            )}
          </div>

          {notifications.length > 0 && (
            <div
              style={{
                padding: '8px 16px',
                borderTop: '1px solid #eee',
                textAlign: 'center',
                fontSize: '0.85rem'
              }}
            >
              <Link
                to="/notifications"
                style={{ color: '#3498db', textDecoration: 'none' }}
                onClick={() => setIsOpen(false)}
              >
                Vedi tutte le notifiche →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}