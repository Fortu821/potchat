// src/components/ChatList.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ChatList() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConversations() {
      if (!user) return

      try {
        // Prende le conversazioni dell'utente con gli ultimi messaggi
        const { data, error } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            conversations (
              id,
              updated_at,
              messages (
                id,
                content,
                sender_id,
                created_at,
                read_at
              ),
              conversation_participants (
                user_id,
                profiles:user_id (
                  id,
                  username,
                  display_name,
                  avatar_url
                )
              )
            )
          `)
          .eq('user_id', user.id)
          .order('conversations(updated_at)', { ascending: false })

        if (error) throw error

        // Formatta i dati
        const formatted = data.map(item => {
          const conv = item.conversations
          const messages = conv.messages || []
          
          // Trova l'altro partecipante
          const otherParticipant = conv.conversation_participants?.find(
            p => p.user_id !== user.id
          )?.profiles

          // Ultimo messaggio
          const lastMessage = messages.length > 0 
            ? messages[messages.length - 1] 
            : null

          // Conta i messaggi non letti (dove read_at è null e sender_id != user.id)
          const unreadCount = messages.filter(
            m => m.read_at === null && m.sender_id !== user.id
          ).length

          return {
            id: conv.id,
            updatedAt: conv.updated_at,
            otherUser: otherParticipant,
            lastMessage: lastMessage,
            unreadCount: unreadCount
          }
        })

        setConversations(formatted)
      } catch (err) {
        console.error('❌ Errore chat:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()

    // Sottoscrizione real-time per nuovi messaggi
    const channel = supabase
      .channel('chat-list')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Ricarica la lista quando arriva un nuovo messaggio
          fetchConversations()
        }
      )
      .subscribe()

    return () => channel.unsubscribe()
  }, [user])

  if (loading) return <div className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>⏳ Caricamento...</div>

  if (conversations.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '40px 20px' }}>
        <span className="emoji">💬</span>
        <h3>Nessuna conversazione</h3>
        <p>Vai su un profilo e inizia una chat!</p>
      </div>
    )
  }

  return (
    <div>
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          to={`/chat/${conv.id}`}
          className="chat-list-item"
        >
          <div className="chat-avatar">
            {conv.otherUser?.avatar_url ? (
              <img src={conv.otherUser.avatar_url} alt={conv.otherUser.display_name} />
            ) : (
              <span>🌱</span>
            )}
          </div>
          <div className="chat-info">
            <div className="chat-name">
              {conv.otherUser?.display_name || conv.otherUser?.username || 'Utente'}
              {conv.unreadCount > 0 && (
                <span className="chat-unread-badge">{conv.unreadCount}</span>
              )}
            </div>
            <div className="chat-preview">
              {conv.lastMessage ? (
                <>
                  <span className="chat-sender">
                    {conv.lastMessage.sender_id === user.id ? 'Tu: ' : ''}
                  </span>
                  {conv.lastMessage.content}
                </>
              ) : (
                <span className="text-muted">Nessun messaggio</span>
              )}
            </div>
          </div>
          <div className="chat-time">
            {conv.lastMessage && (
              <span>
                {new Date(conv.lastMessage.created_at).toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}