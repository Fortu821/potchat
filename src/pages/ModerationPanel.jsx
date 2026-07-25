// src/pages/ModerationPanel.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ModerationPanel() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [hiddenPosts, setHiddenPosts] = useState([])
  const [blockedUsers, setBlockedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reports')

  // Verifica che l'utente sia moderatore o admin
  const isModerator = user?.role === 'moderator' || user?.role === 'admin'

  // Carica i dati
  useEffect(() => {
    if (!isModerator) return
    fetchAllData()
  }, [isModerator])

  async function fetchAllData() {
    setLoading(true)
    try {
      // 1. Segnalazioni
      const { data: reportsData } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:reporter_id (username, display_name),
          reviewer:reviewed_by (username, display_name)
        `)
        .order('created_at', { ascending: false })

      setReports(reportsData || [])

      // 2. Post nascosti
      const { data: hiddenData } = await supabase
        .from('posts_with_counts')
        .select('*')
        .eq('hidden', true)
        .order('created_at', { ascending: false })

      setHiddenPosts(hiddenData || [])

      // 3. Utenti bloccati
      const { data: blockedData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, blocked')
        .eq('blocked', true)
        .order('created_at', { ascending: false })

      setBlockedUsers(blockedData || [])

    } catch (err) {
      console.error('❌ Errore caricamento dati moderazione:', err)
    } finally {
      setLoading(false)
    }
  }

  // ---- AZIONI SULLE SEGNALAZIONI ----
  async function updateReportStatus(reportId, status, actionTaken = null) {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          action_taken: actionTaken
        })
        .eq('id', reportId)

      if (error) throw error
      await fetchAllData()
    } catch (err) {
      console.error('❌ Errore aggiornamento segnalazione:', err)
      alert('Errore durante l\'aggiornamento')
    }
  }

  // ---- AZIONI SUI POST NASCOSTI ----
  async function restorePost(postId) {
    if (!confirm('Ripristinare questo post?')) return
    try {
      const { error } = await supabase
        .from('posts')
        .update({ hidden: false })
        .eq('id', postId)

      if (error) throw error
      await fetchAllData()
    } catch (err) {
      console.error('❌ Errore ripristino post:', err)
      alert('Errore durante il ripristino')
    }
  }

  // ---- AZIONI SUGLI UTENTI BLOCCATI ----
  async function unblockUser(userId) {
    if (!confirm('Sbloccare questo utente?')) return
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ blocked: false })
        .eq('id', userId)

      if (error) throw error
      await fetchAllData()
    } catch (err) {
      console.error('❌ Errore sblocco utente:', err)
      alert('Errore durante lo sblocco')
    }
  }

  // ---- RENDER ACCESSO NEGATO ----
  if (!isModerator) {
    return (
      <div className="app-container" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️</div>
        <h2>Accesso negato</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Solo moderatori e amministratori possono accedere a questa pagina.
        </p>
        <Link to="/" className="btn btn-secondary">← Torna alla home</Link>
      </div>
    )
  }

  if (loading) {
    return <div className="app-container text-center" style={{ paddingTop: '60px' }}>
      <div className="text-muted loading-pulse">⏳ Caricamento...</div>
    </div>
  }

  return (
    <div className="app-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>🛡️ Pannello di moderazione</h1>
        <Link to="/" className="btn btn-secondary btn-sm">← Home</Link>
      </div>

      {/* Tabs */}
      <div className="filter-bar">
        <button
          onClick={() => setActiveTab('reports')}
          className={`filter-btn ${activeTab === 'reports' ? 'active-recent' : ''}`}
        >
          🚨 Segnalazioni ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('hidden')}
          className={`filter-btn ${activeTab === 'hidden' ? 'active-recent' : ''}`}
        >
          🔒 Post nascosti ({hiddenPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`filter-btn ${activeTab === 'blocked' ? 'active-recent' : ''}`}
        >
          🚫 Utenti bloccati ({blockedUsers.length})
        </button>
      </div>

      {/* ========== SEGNALAZIONI ========== */}
      {activeTab === 'reports' && (
        <>
          {reports.length === 0 ? (
            <div className="empty-state">
              <span className="emoji">📭</span>
              <h3>Nessuna segnalazione</h3>
              <p>Tutti i contenuti sono puliti!</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong>{report.reason}</strong>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        background: report.status === 'pending' ? '#f39c12' :
                                   report.status === 'reviewed' ? '#3498db' :
                                   report.status === 'dismissed' ? '#95a5a6' : '#e74c3c',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Segnalato da @{report.reporter?.username}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Target: {report.target_type} | ID: {report.target_id}
                    </div>
                    {report.description && (
                      <p style={{ margin: '8px 0', fontSize: '0.9rem', backgroundColor: 'var(--color-bg)', padding: '8px', borderRadius: '6px' }}>
                        💬 {report.description}
                      </p>
                    )}
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {new Date(report.created_at).toLocaleString('it-IT')}
                    </div>
                    {report.reviewed_by && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        Reviewed by @{report.reviewer?.username} il {new Date(report.reviewed_at).toLocaleString('it-IT')}
                      </div>
                    )}
                  </div>

                  {report.status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        onClick={() => updateReportStatus(report.id, 'reviewed')}
                        className="btn btn-secondary btn-sm"
                      >
                        👁️ Reviewed
                      </button>
                      <button
                        onClick={() => updateReportStatus(report.id, 'dismissed')}
                        className="btn btn-outline btn-sm"
                      >
                        ❌ Dismiss
                      </button>
                      <button
                        onClick={() => updateReportStatus(report.id, 'action_taken', 'Contenuto rimosso')}
                        className="btn btn-danger btn-sm"
                      >
                        🚫 Action
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ========== POST NASCOSTI ========== */}
      {activeTab === 'hidden' && (
        <>
          {hiddenPosts.length === 0 ? (
            <div className="empty-state">
              <span className="emoji">🔓</span>
              <h3>Nessun post nascosto</h3>
              <p>Tutti i post sono visibili.</p>
            </div>
          ) : (
            hiddenPosts.map(post => (
              <div key={post.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong>@{post.username}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        {new Date(post.created_at).toLocaleString('it-IT')}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0' }}>{post.content}</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      ❤️ {post.likes_count || 0} • 💬 {post.comments_count || 0} • 🔄 {post.reposts_count || 0}
                    </div>
                  </div>
                  <button
                    onClick={() => restorePost(post.id)}
                    className="btn btn-success btn-sm"
                  >
                    🔓 Ripristina
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ========== UTENTI BLOCCATI ========== */}
      {activeTab === 'blocked' && (
        <>
          {blockedUsers.length === 0 ? (
            <div className="empty-state">
              <span className="emoji">🌟</span>
              <h3>Nessun utente bloccato</h3>
              <p>Tutti gli utenti sono attivi!</p>
            </div>
          ) : (
            blockedUsers.map(user => (
              <div key={user.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-border)' }} />
                  )}
                  <div>
                    <div><strong>{user.display_name || user.username}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>@{user.username}</div>
                  </div>
                </div>
                <button
                  onClick={() => unblockUser(user.id)}
                  className="btn btn-success btn-sm"
                >
                  🔓 Sblocca
                </button>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}