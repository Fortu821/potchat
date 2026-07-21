// src/components/Comments.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Comments({ postId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null) // { id, username }
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ----- CARICA I COMMENTI (inclusi quelli già scritti) -----
  useEffect(() => {
    fetchComments()
  }, [postId])

async function fetchComments() {
  setLoading(true)
  try {
    // Usa la vista appena creata
    const { data, error } = await supabase
      .from('comments_with_profiles')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) throw error
    console.log('📝 Commenti caricati (vista):', data) // Per debug

    // Ora devi ricostruire l'albero come prima, ma i dati hanno già i campi del profilo
    // Quindi adatta la struttura: i campi username, display_name, avatar_url sono già nella riga
    const commentMap = {}
    const rootComments = []

    data.forEach(comment => {
      // Aggiungi un oggetto 'profiles' fittizio per mantenere compatibilità con il render
      comment.profiles = {
        username: comment.username,
        display_name: comment.display_name,
        avatar_url: comment.avatar_url
      }
      commentMap[comment.id] = { ...comment, replies: [] }
    })

    data.forEach(comment => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies.push(commentMap[comment.id])
      } else {
        rootComments.push(commentMap[comment.id])
      }
    })

    setComments(rootComments)
  } catch (err) {
    console.error('❌ Errore nel caricamento commenti:', err)
  } finally {
    setLoading(false)
  }
}

  // ----- INVIA NUOVO COMMENTO (alla radice) -----
  async function handleSubmitComment(e) {
    e.preventDefault()
    if (!user) {
      alert('Devi essere loggato per commentare')
      return
    }
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: postId,
          parent_id: replyTo?.id || null,
          content: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      setReplyTo(null)
      await fetchComments()
    } catch (err) {
      console.error('❌ Errore nell\'invio commento:', err)
      alert('Errore nell\'invio del commento')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ----- COMPONENTE PER UN SINGOLO COMMENTO (ricorsivo) -----
  function CommentItem({ comment, depth = 0 }) {
    const [showReplyForm, setShowReplyForm] = useState(false)
    const isOwnComment = user?.id === comment.user_id

    return (
      <div
        style={{
          marginLeft: depth > 0 ? '24px' : '0',
          padding: '8px 0 8px 12px',
          borderLeft: depth > 0 ? '2px solid #ddd' : 'none',
          marginTop: '4px'
        }}
      >
        {/* Intestazione */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          {comment.profiles?.avatar_url ? (
            <img
              src={comment.profiles.avatar_url}
              alt="avatar"
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ccc' }} />
          )}
          <strong style={{ fontSize: '0.9rem' }}>
            {comment.profiles?.display_name || comment.profiles?.username || 'Anonimo'}
          </strong>
          <span style={{ fontSize: '0.75rem', color: '#888' }}>
            @{comment.profiles?.username}
          </span>
          {isOwnComment && (
            <span style={{ fontSize: '0.7rem', backgroundColor: '#e8f5e9', padding: '0 6px', borderRadius: '4px' }}>
              tu
            </span>
          )}
          <span style={{ fontSize: '0.7rem', color: '#aaa', marginLeft: 'auto' }}>
            {new Date(comment.created_at).toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
          </span>
        </div>

        {/* Contenuto */}
        <p style={{ margin: '2px 0 4px 36px', fontSize: '0.95rem', wordBreak: 'break-word' }}>
          {comment.content}
        </p>

        {/* Pulsante Rispondi */}
        <div style={{ marginLeft: '36px', display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: user ? 'pointer' : 'default',
              padding: '2px 8px',
              fontSize: '0.8rem'
            }}
            title={user ? 'Rispondi' : 'Devi essere loggato per rispondere'}
          >
            ↩️ Rispondi
          </button>
        </div>

        {/* Form per rispondere a questo commento */}
        {showReplyForm && user && (
          <ReplyForm
            parentComment={comment}
            onCancel={() => setShowReplyForm(false)}
            onReply={async (content) => {
              try {
                await supabase
                  .from('comments')
                  .insert({
                    user_id: user.id,
                    post_id: postId,
                    parent_id: comment.id,
                    content: content.trim()
                  })
                await fetchComments()
                setShowReplyForm(false)
              } catch (err) {
                console.error('❌ Errore risposta:', err)
                alert('Errore nell\'invio della risposta')
              }
            }}
          />
        )}

        {/* Sotto-commenti (ricorsione) */}
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ----- FORM PER RISPONDERE (inline) -----
  function ReplyForm({ parentComment, onCancel, onReply }) {
    const [content, setContent] = useState('')
    const [isSending, setIsSending] = useState(false)

    const handleSubmit = async (e) => {
      e.preventDefault()
      if (!content.trim()) return
      setIsSending(true)
      await onReply(content)
      setIsSending(false)
    }

    return (
      <form
        onSubmit={handleSubmit}
        style={{
          marginLeft: '36px',
          marginTop: '4px',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}
      >
        <span style={{ fontSize: '0.85rem', color: '#555', paddingTop: '4px' }}>
          @{parentComment.profiles?.username}:
        </span>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Rispondi..."
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '0.9rem',
            fontFamily: 'inherit'
          }}
          autoFocus
        />
        <button
          type="submit"
          disabled={isSending || !content.trim()}
          style={{
            padding: '6px 14px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            opacity: (isSending || !content.trim()) ? 0.6 : 1
          }}
        >
          {isSending ? '...' : 'Invia'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '6px 10px',
            background: 'none',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: '#666'
          }}
        >
          Annulla
        </button>
      </form>
    )
  }

  // ----- RENDER PRINCIPALE -----
  if (loading) return <div style={{ padding: '8px', fontSize: '0.9rem', color: '#888' }}>⏳ Caricamento commenti...</div>

  return (
    <div style={{ marginTop: '8px' }}>
      {/* Form per nuovo commento in cima */}
      <form onSubmit={handleSubmitComment} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? `Rispondi a @${replyTo.username}...` : 'Scrivi un commento...'}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '0.95rem',
            fontFamily: 'inherit'
          }}
          disabled={!user}
        />
        <button
          type="submit"
          disabled={!user || isSubmitting || !newComment.trim()}
          style={{
            padding: '8px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: user ? 'pointer' : 'default',
            fontSize: '0.95rem',
            opacity: (!user || isSubmitting || !newComment.trim()) ? 0.6 : 1
          }}
        >
          {isSubmitting ? '⏳' : 'Invia'}
        </button>
        {replyTo && (
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            style={{
              padding: '8px 12px',
              background: 'none',
              border: '1px solid #ccc',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#666'
            }}
          >
            ✕
          </button>
        )}
      </form>

      {/* Messaggio per non loggati */}
      {!user && (
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>
          <Link to="/login">Accedi</Link> o <Link to="/signup">registrati</Link> per commentare.
        </p>
      )}

      {/* LISTA COMMENTI ESISTENTI */}
      {comments.length === 0 ? (
        <p style={{ fontSize: '0.9rem', color: '#aaa', margin: '4px 0' }}>
          Nessun commento. Sii il primo!
        </p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} depth={0} />
          ))}
        </div>
      )}
    </div>
  )
}