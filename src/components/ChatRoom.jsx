// src/components/ChatRoom.jsx
import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ChatRoom() {
  const { conversationId } = useParams()
  const { user } = useAuth()

  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef(null)

  // ----- SCROLL IN BASSO -----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ----- CARICA MESSAGGI E PARTECIPANTI (query separate) -----
  useEffect(() => {
    if (!user || !conversationId) return

    let isMounted = true

    async function fetchChatData() {
      try {
        // 1. Prende i messaggi
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError

        // 2. Prende SOLO gli user_id dei partecipanti
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversationId)

        if (participantsError) throw participantsError

        // 3. Trova l'ID dell'altro utente (diverso da me)
        const otherUserId = participants?.find(p => p.user_id !== user.id)?.user_id

        // 4. Prende il profilo dell'altro utente
        let otherProfile = null
        if (otherUserId) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', otherUserId)
            .single()

          if (!profileError) otherProfile = profile
        }

        if (isMounted) {
          setMessages(messagesData || [])
          setOtherUser(otherProfile)
        }

        // 5. Segna i messaggi come letti
        const unreadIds = messagesData
          ?.filter(m => m.sender_id !== user.id && m.read_at === null)
          .map(m => m.id) || []

        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadIds)
        }

      } catch (err) {
        console.error('❌ Errore caricamento chat:', err)
        alert('Errore nel caricamento della chat')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchChatData()

    // ----- REAL-TIME: ascolta nuovi messaggi -----
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMsg = payload.new
          setMessages(prev => [...prev, newMsg])

          if (newMsg.sender_id !== user.id) {
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMsg.id)
              .then(({ error }) => {
                if (error) console.error('❌ Errore segna come letto:', error)
              })
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 Chat channel status:', status)
      })

    return () => {
      isMounted = false
      channel.unsubscribe()
    }
  }, [conversationId, user])

  // ----- INVIA MESSAGGIO -----
  async function sendMessage(e) {
    e.preventDefault()

    if (!newMessage.trim() || isSending) return
    if (!user) {
      alert('Devi essere loggato per inviare messaggi')
      return
    }

    setIsSending(true)

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim()
        })

      if (error) throw error
      setNewMessage('')
    } catch (err) {
      console.error('❌ Errore invio messaggio:', err)
      alert('Errore nell\'invio del messaggio')
    } finally {
      setIsSending(false)
    }
  }

  // ----- RENDER -----
  if (loading) {
    return (
      <div className="chat-room" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="text-muted">⏳ Caricamento chat...</div>
      </div>
    )
  }

  return (
    <div className="chat-room">
      {/* HEADER */}
      <div className="chat-room-header">
        <Link to="/chats" className="chat-back">←</Link>
        <div className="chat-room-user">
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.display_name}
              className="chat-room-avatar"
            />
          ) : (
            <div className="chat-room-avatar-placeholder">🌱</div>
          )}
          <span className="chat-room-name">
            {otherUser?.display_name || otherUser?.username || 'Utente'}
          </span>
        </div>
      </div>

      {/* MESSAGGI */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <span>💬</span>
            <p>Nessun messaggio. Inizia la conversazione!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user.id
            return (
              <div
                key={msg.id}
                className={`chat-message ${isMine ? 'mine' : 'theirs'}`}
              >
                <div className="chat-bubble">
                  {msg.content}
                  <div className="chat-message-time">
                    {new Date(msg.created_at).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {isMine && msg.read_at && ' ✓'}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Scrivi un messaggio..."
          className="chat-input"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="btn btn-primary chat-send-btn"
        >
          {isSending ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  )
}