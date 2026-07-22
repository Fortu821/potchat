// src/components/Comments.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Comments({ postId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // EDIT COMMENT
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  // ----- CARICA COMMENTI -----
  useEffect(() => {
    fetchComments()
  }, [postId])

  async function fetchComments() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const commentMap = {}
      const rootComments = []

      data.forEach(comment => {
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

  // ----- INVIA COMMENTO -----
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

  // ----- EDIT COMMENT -----
  async function handleEditComment(commentId) {
    if (!editCommentContent.trim()) return

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editCommentContent.trim() })
        .eq('id', commentId)
        .eq('user_id', user.id)

      if (error) throw error
      setEditingCommentId(null)
      setEditCommentContent('')
      await fetchComments()
    } catch (err) {
      console.error('❌ Errore modifica commento:', err)
      alert('Errore nella modifica del commento')
    }
  }

  // ----- RENDER -----
  function CommentItem({ comment, depth = 0 }) {
    const [showReplyForm, setShowReplyForm] = useState(false)
    const isOwnComment = user?.id === comment.user_id
    const isEditing = editingCommentId === comment.id

    return (
      <div
        style={{
          marginLeft: depth > 0 ? '24px' : '0',
          padding: '8px 0 8px 12px',
          borderLeft: depth > 0 ? '2px solid var(--color-border)' : 'none',
          marginTop: '4px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          {comment.profiles?.avatar_url ? (
            <img
              src={comment.profiles.avatar_url}
              alt="avatar"
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-border)' }} />
          )}
          <strong style={{ fontSize: '0.9rem' }}>
            {comment.profiles?.display_name || comment.profiles?.username || 'Anonimo'}
          </strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            @{comment.profiles?.username}
          </span>
          {isOwnComment && (
            <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-primary-bg)', padding: '0 6px', borderRadius: '4px' }}>
              tu
            </span>
          )}
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            {new Date(comment.created_at).toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
          </span>
        </div>

        {/* Contenuto o edit */}
        {isEditing ? (
          <div style={{ marginLeft: '36px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <input
              type="text"
              value={editCommentContent}
              onChange={(e) => setEditCommentContent(e.target.value)}
              className="input"
              style={{ flex: 1 }}
              autoFocus
            />
            <button
              onClick={() => handleEditComment(comment.id)}
              className="btn btn-success btn-sm"
              disabled={!editCommentContent.trim()}
            >
              💾
            </button>
            <button
              onClick={() => setEditingCommentId(null)}
              className="btn btn-outline btn-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <p style={{ margin: '2px 0 4px 36px', fontSize: '0.95rem', wordBreak: 'break-word' }}>
            {comment.content}
          </p>
        )}

        {/* Bottoni azioni */}
        <div style={{ marginLeft: '36px', display: 'flex', gap: '12px', fontSize: '0.8rem', marginTop: '2px' }}>
          {!isEditing && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: user ? 'pointer' : 'default',
                padding: '2px 8px',
                fontSize: '0.8rem'
              }}
              title={user ? 'Rispondi' : 'Devi essere loggato per rispondere'}
            >
              ↩️ Rispondi
            </button>
          )}

          {!isEditing && isOwnComment && (
            <button
              onClick={() => {
                setEditingCommentId(comment.id)
                setEditCommentContent(comment.content || '')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '2px 8px',
                fontSize: '0.8rem'
              }}
            >
              ✏️ Modifica
            </button>
          )}
        </div>

        {/* Form rispondi */}
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

        {/* Sotto-commenti */}
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

  // ----- FORM RISPOSTA -----
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
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', paddingTop: '4px' }}>
          @{parentComment.profiles?.username}:
        </span>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Rispondi..."
          className="input"
          style={{ flex: 1, padding: '6px 10px', fontSize: '0.9rem' }}
          autoFocus
        />
        <button
          type="submit"
          disabled={isSending || !content.trim()}
          className="btn btn-primary btn-sm"
        >
          {isSending ? '...' : 'Invia'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline btn-sm"
        >
          Annulla
        </button>
      </form>
    )
  }

  // ----- RENDER PRINCIPALE -----
  if (loading) return <div style={{ padding: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>⏳ Caricamento commenti...</div>

  return (
    <div style={{ marginTop: '8px' }}>
      <form onSubmit={handleSubmitComment} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? `Rispondi a @${replyTo.username}...` : 'Scrivi un commento...'}
          className="input"
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.95rem' }}
          disabled={!user}
        />
        <button
          type="submit"
          disabled={!user || isSubmitting || !newComment.trim()}
          className="btn btn-primary"
          style={{ opacity: (!user || isSubmitting || !newComment.trim()) ? 0.6 : 1 }}
        >
          {isSubmitting ? '⏳' : 'Invia'}
        </button>
        {replyTo && (
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="btn btn-outline"
            style={{ padding: '8px 12px' }}
          >
            ✕
          </button>
        )}
      </form>

      {!user && (
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          <Link to="/login">Accedi</Link> o <Link to="/signup">registrati</Link> per commentare.
        </p>
      )}

      {comments.length === 0 ? (
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '4px 0' }}>
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