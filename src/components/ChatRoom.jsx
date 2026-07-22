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
  const [isRefreshing, setIsRefreshing] = useState(false)

  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)

  // ----- SCROLL IN BASSO -----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ----- CARICA MESSAGGI -----
  async function fetchMessages() {
    if (!user || !conversationId) return

    setIsRefreshing(true)
    try {
      // 1. Prende i messaggi
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      // 2. Prende i partecipanti
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)

      if (participantsError) throw participantsError

      // 3. Trova l'altro utente
      const otherUserId = participants?.find(p => p.user_id !== user.id)?.user_id
      let otherProfile = null

      if (otherUserId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', otherUserId)
          .single()

        if (!profileError) otherProfile = profile
      }

      setMessages(messagesData || [])
      setOtherUser(otherProfile)

      // 4. Segna come letti
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
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // ----- CARICA ALL'AVVIO -----
  useEffect(() => {
    fetchMessages()
  }, [conversationId, user])

  // ----- REAL-TIME (con fallback) -----
  useEffect(() => {
    if (!conversationId || !user) return

    // Sottoscrizione al canale
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
          console.log('📩 Nuovo messaggio ricevuto in real-time:', newMsg)

          // Aggiunge il messaggio alla lista
          setMessages(prev => [...prev, newMsg])

          // Segna come letto se non è mio
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
        // Se il canale non si sottoscrive, ricarica manualmente dopo 2 secondi
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setTimeout(() => {
            console.log('🔄 Fallback: refresh manuale dei messaggi')
            fetchMessages()
          }, 2000)
        }
      })

    channelRef.current = channel

    return () => {
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

      // 🔄 FORZA IL REFRESH DEI MESSAGGI (fallback)
      // Aspetta 500ms poi ricarica per sicurezza
      setTimeout(() => {
        fetchMessages()
      }, 500)

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
          {/* Indica se la connessione real-time è attiva */}
          {isRefreshing && (
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
              ↻
            </span>
          )}
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