// src/pages/Home.jsx
import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Comments from '../components/Comments'
import ThemeToggle from '../components/ThemeToggle'
import ReportButton from '../components/ReportButton'
import MediaUpload from '../components/MediaUpload'
import { parseText } from '../utils/textParser'

export default function Home() {
  const { user, signOut } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('recent')
  const [page, setPage] = useState(0)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentingPostId, setCommentingPostId] = useState(null)

  const [mediaUrl, setMediaUrl] = useState(null)
  const [mediaType, setMediaType] = useState(null)

  const [editingPostId, setEditingPostId] = useState(null)
  const [editPostContent, setEditPostContent] = useState('')

  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikesReceived: 0,
    totalCommentsReceived: 0,
    totalRepostsReceived: 0,
    followers: 0,
    following: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  const observerRef = useRef()
  const lastPostRef = useCallback((node) => {
    if (loading || loadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [loading, loadingMore, hasMore])

  const POSTS_PER_PAGE = 10

  // ----- NOTIFICHE PUSH -----
  useEffect(() => {
    if (!user) return

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const channel = supabase
      .channel('push-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notif = payload.new
          if ('Notification' in window && Notification.permission === 'granted') {
            const actorName = notif.actor_id?.display_name || 'Qualcuno'
            let message = ''
            switch (notif.type) {
              case 'like': message = 'ha messo like al tuo post'; break
              case 'comment': message = 'ha commentato il tuo post'; break
              case 'repost': message = 'ha repostato il tuo post'; break
              case 'follow': message = 'ti ha seguito'; break
              default: message = 'ha interagito con te'
            }
            new Notification(`🌱 ${actorName} ${message}`, {
              icon: '/favicon.ico',
              tag: notif.id,
              requireInteraction: true
            })
          }
        }
      )
      .subscribe()

    return () => channel.unsubscribe()
  }, [user])

  // ----- CARICA POST -----
  useEffect(() => {
    setPage(0)
    setPosts([])
    setHasMore(true)
    fetchPosts(filter, 0, true)
  }, [filter])

  async function fetchPosts(selectedFilter, pageNum = 0, reset = false) {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('posts_with_counts')
        .select('*')
        .range(pageNum * POSTS_PER_PAGE, (pageNum + 1) * POSTS_PER_PAGE - 1)

      if (selectedFilter === 'following') {
        if (!user) {
          setError('Devi essere loggato')
          setLoading(false)
          return
        }

        const { data: following, error: followError } = await supabase
          .from('follows')
          .select('followed_id')
          .eq('follower_id', user.id)

        if (followError) throw followError

        const followedIds = following.map(f => f.followed_id)

        if (followedIds.length === 0) {
          setPosts([])
          setHasMore(false)
          setLoading(false)
          return
        }

        query = query.in('user_id', followedIds)
      }

      if (selectedFilter === 'popular') {
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

        query = query
          .gte('created_at', twentyFourHoursAgo.toISOString())
          .order('likes_count', { ascending: false })
      }

      if (selectedFilter === 'recent') {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      if (reset) {
        setPosts(data || [])
      } else {
        setPosts(prev => [...prev, ...(data || [])])
      }

      setHasMore((data || []).length === POSTS_PER_PAGE)
      setPage(pageNum + 1)

    } catch (err) {
      console.error('❌ Errore nel caricamento dei post:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function loadMorePosts() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    await fetchPosts(filter, page, false)
  }

  // ----- CARICA STATS -----
  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setStatsLoading(false)
        return
      }

      try {
        const { count: totalPosts } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        const { count: totalLikes } = await supabase
          .from('likes')
          .select('*, posts!inner(user_id)', { count: 'exact', head: true })
          .eq('posts.user_id', user.id)

        const { count: totalComments } = await supabase
          .from('comments')
          .select('*, posts!inner(user_id)', { count: 'exact', head: true })
          .eq('posts.user_id', user.id)

        const { count: totalReposts } = await supabase
          .from('reposts')
          .select('*, posts!inner(user_id)', { count: 'exact', head: true })
          .eq('posts.user_id', user.id)

        const { count: followers } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('followed_id', user.id)

        const { count: following } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id)

        setStats({
          totalPosts: totalPosts || 0,
          totalLikesReceived: totalLikes || 0,
          totalCommentsReceived: totalComments || 0,
          totalRepostsReceived: totalReposts || 0,
          followers: followers || 0,
          following: following || 0
        })
      } catch (err) {
        console.error('❌ Errore stats:', err)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [user])

  async function refreshPosts() {
    setPage(0)
    setPosts([])
    setHasMore(true)
    await fetchPosts(filter, 0, true)
  }

  // ----- CREA POST -----
  async function handleCreatePost(e) {
    e.preventDefault()
    if (!user) {
      alert('Devi essere loggato per pubblicare')
      return
    }
    if (!newPostContent.trim() && !mediaUrl) {
      alert('Scrivi qualcosa o allega un file')
      return
    }

    if (!confirm('📝 Sei sicuro di voler pubblicare questo post?')) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: newPostContent.trim() || null,
          media_url: mediaUrl || null,
          media_type: mediaType || null
        })

      if (error) throw error

      setNewPostContent('')
      setMediaUrl(null)
      setMediaType(null)
      await refreshPosts()
    } catch (err) {
      console.error('❌ Errore nella pubblicazione:', err)
      alert('Errore nella pubblicazione del post')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ----- EDIT POST -----
  async function handleEditPost(postId) {
    if (!editPostContent.trim()) return

    if (!confirm('✏️ Sei sicuro di voler modificare questo post?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editPostContent.trim() })
        .eq('id', postId)
        .eq('user_id', user.id)

      if (error) throw error
      setEditingPostId(null)
      setEditPostContent('')
      await refreshPosts()
    } catch (err) {
      console.error('❌ Errore modifica:', err)
      alert('Errore nella modifica del post')
    }
  }

  // ----- LIKE -----
  async function handleLike(postId) {
    if (!user) {
      alert('Devi essere loggato per mettere like')
      return
    }

    try {
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: postId })
      }

      await refreshPosts()
    } catch (err) {
      console.error('❌ Errore like:', err)
    }
  }

  // ----- REPOST -----
  async function handleRepost(postId) {
    if (!user) {
      alert('Devi essere loggato per repostare')
      return
    }

    try {
      const { data: existing } = await supabase
        .from('reposts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('reposts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
      } else {
        await supabase
          .from('reposts')
          .insert({ user_id: user.id, post_id: postId })
      }

      await refreshPosts()
    } catch (err) {
      console.error('❌ Errore repost:', err)
    }
  }

  // ----- RENDER -----
  if (loading && posts.length === 0) {
    return (
      <div className="app-container text-center" style={{ paddingTop: '60px' }}>
        <div className="text-muted loading-pulse">⏳ Caricamento...</div>
      </div>
    )
  }

  if (error && filter !== 'following') {
    return (
      <div className="app-container text-center" style={{ paddingTop: '60px', color: 'var(--color-danger)' }}>
        ❌ Errore: {error}
      </div>
    )
  }

  return (
    <div className="home-layout">
      <aside className="sidebar-left">
        <div className="sidebar-logo">
          <Link to="/">
            <span className="emoji">🌱</span>
            <span className="highlight">Pianta</span>Social
          </Link>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} search-desktop-link`}>
            <span className="nav-icon">🔍</span>
            <span className="nav-label">Cerca</span>
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🔔</span>
            <span className="nav-label">Notifiche</span>
          </NavLink>
          <NavLink to="/chats" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">💬</span>
            <span className="nav-label">Messaggi</span>
          </NavLink>
          <NavLink to={`/profile/${user?.username || 'me'}`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profilo</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <ThemeToggle />
          {user ? (
            <button onClick={signOut} className="btn btn-danger btn-sm" style={{ width: '100%' }}>
              🚪 Logout
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                Accedi
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                Registrati
              </Link>
            </div>
          )}
        </div>
      </aside>

      <main className="feed-main">
        <div className="feed-header">
          <h2>📰 Feed</h2>
          <Link to="/search" className="btn btn-outline btn-sm search-mobile-btn">
            🔍 Cerca
          </Link>
        </div>

        <div className="filter-bar">
          <button
            onClick={() => setFilter('recent')}
            className={`filter-btn ${filter === 'recent' ? 'active-recent' : ''}`}
          >
            📰 Più recenti
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`filter-btn ${filter === 'popular' ? 'active-popular' : ''}`}
          >
            🔥 Popolari (24h)
          </button>
          <button
            onClick={() => setFilter('following')}
            className={`filter-btn ${filter === 'following' ? 'active-following' : ''}`}
            disabled={!user}
            title={!user ? 'Devi essere loggato' : ''}
          >
            👥 Seguiti
          </button>
        </div>

        {user ? (
          <form onSubmit={handleCreatePost} className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="card-avatar" style={{ marginTop: '4px' }} />
              ) : (
                <div className="card-avatar-placeholder" style={{ marginTop: '4px' }}>🌱</div>
              )}
              <div style={{ flex: 1 }}>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Cosa bolle in pentola? 🌱 (usa @ per menzionare, # per hashtag)"
                  rows={3}
                  className="textarea"
                />
                <MediaUpload
                  onUpload={(url, type) => {
                    setMediaUrl(url)
                    setMediaType(type)
                  }}
                  onRemove={() => {
                    setMediaUrl(null)
                    setMediaType(null)
                  }}
                />
                {mediaUrl && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    ✅ File caricato: {mediaType === 'image' ? '📷 Immagine' : '🎬 Video'}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || (!newPostContent.trim() && !mediaUrl)}
                  className="btn btn-primary"
                  style={{ marginTop: '8px' }}
                >
                  {isSubmitting ? '⏳ Pubblicazione...' : '🌱 Pubblica'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="card" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p className="text-muted">
              Per pubblicare un post, <Link to="/login">accedi</Link> o <Link to="/signup">registrati</Link>.
            </p>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="empty-state">
            {filter === 'following' ? (
              <>
                <span className="emoji">👀</span>
                <h3>Non segui ancora nessuno</h3>
                <p>Segui altri utenti per vedere i loro post qui!</p>
              </>
            ) : filter === 'popular' ? (
              <>
                <span className="emoji">🔥</span>
                <h3>Nessun post popolare oggi</h3>
                <p>Aspetta che qualcuno pubblichi qualcosa di interessante!</p>
              </>
            ) : (
              <>
                <span className="emoji">📭</span>
                <h3>Nessun post trovato</h3>
                <p>Sii il primo a scrivere qualcosa!</p>
              </>
            )}
          </div>
        ) : (
          posts.map((post, index) => {
            const isLiked = post.is_liked_by_user || false
            const isReposted = post.is_reposted_by_user || false
            const isCommenting = commentingPostId === post.id
            const isOwnPost = user && user.id === post.user_id

            let mediaType = post.media_type
            if (post.media_url && !mediaType) {
              if (post.media_url.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
                mediaType = 'video'
              } else {
                mediaType = 'image'
              }
            }

            return (
              <div
                key={post.id}
                className="card"
                ref={index === posts.length - 1 ? lastPostRef : null}
              >
                <div className="card-header">
                  <Link to={`/profile/${post.username}`}>
                    {post.avatar_url ? (
                      <img src={post.avatar_url} alt="avatar" className="card-avatar" />
                    ) : (
                      <div className="card-avatar-placeholder">🌱</div>
                    )}
                  </Link>
                  <div>
                    <Link to={`/profile/${post.username}`} className="card-author-link">
                      <span className="card-author">
                        {post.display_name || post.username || 'Anonimo'}
                      </span>
                    </Link>
                    <Link to={`/profile/${post.username}`} className="card-username">
                      @{post.username}
                    </Link>
                  </div>
                </div>

                <div className="card-content">{parseText(post.content)}</div>

                {post.media_url && (
                  <div className="post-media" style={{ marginTop: '8px' }}>
                    {mediaType === 'video' ? (
                      <video
                        src={post.media_url}
                        controls
                        className="post-media-video"
                        controlsList="nodownload"
                        style={{
                          width: '100%',
                          maxHeight: '400px',
                          borderRadius: 'var(--radius-sm)',
                          background: '#000'
                        }}
                      />
                    ) : (
                      <img
                        src={post.media_url}
                        alt="Contenuto del post"
                        className="post-media-image"
                        style={{
                          width: '100%',
                          maxHeight: '400px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                  </div>
                )}

                {isOwnPost && (
                  <div style={{ marginTop: '4px' }}>
                    {editingPostId === post.id ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <textarea
                          value={editPostContent}
                          onChange={(e) => setEditPostContent(e.target.value)}
                          className="textarea"
                          style={{ flex: 1, minHeight: '60px' }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditPost(post.id)}
                          className="btn btn-success btn-sm"
                          disabled={!editPostContent.trim()}
                        >
                          💾 Salva
                        </button>
                        <button
                          onClick={() => setEditingPostId(null)}
                          className="btn btn-outline btn-sm"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPostId(post.id)
                          setEditPostContent(post.content || '')
                        }}
                        className="post-action"
                      >
                        ✏️ Modifica
                      </button>
                    )}
                  </div>
                )}

                <div className="card-footer">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`post-action ${isLiked ? 'liked' : ''}`}
                    disabled={!user}
                    title={user ? (isLiked ? 'Rimuovi like' : 'Metti like') : 'Devi essere loggato'}
                  >
                    {isLiked ? '❤️' : '🤍'} {post.likes_count || 0}
                  </button>

                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Devi essere loggato per commentare')
                        return
                      }
                      setCommentingPostId(isCommenting ? null : post.id)
                    }}
                    className="post-action"
                    disabled={!user}
                  >
                    💬 {post.comments_count || 0}
                  </button>

                  <button
                    onClick={() => handleRepost(post.id)}
                    className={`post-action ${isReposted ? 'reposted' : ''}`}
                    disabled={!user}
                    title={user ? (isReposted ? 'Rimuovi repost' : 'Reposta') : 'Devi essere loggato'}
                  >
                    🔄 {post.reposts_count || 0}
                  </button>

                  {user && (
                    <ReportButton targetType="post" targetId={post.id} />
                  )}
                </div>

                {isCommenting && (
                  <div className="comment-thread">
                    <Comments postId={post.id} />
                  </div>
                )}
              </div>
            )
          })
        )}

        {loadingMore && (
          <div className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
            <span className="loading-pulse">⏳ Caricamento altri post...</span>
          </div>
        )}
      </main>

      <aside className="sidebar-right">
        <div className="sidebar-card">
          <h4>📊 Le tue stats</h4>
          {!user ? (
            <div style={{ textAlign: 'center' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                <Link to="/login">Accedi</Link> per vedere le tue statistiche.
              </p>
            </div>
          ) : statsLoading ? (
            <div className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center' }}>
              <span className="loading-pulse">⏳ Caricamento...</span>
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats.totalPosts}</span>
                <span className="stat-label">Post</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalLikesReceived}</span>
                <span className="stat-label">Like ricevuti</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalCommentsReceived}</span>
                <span className="stat-label">Commenti ricevuti</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalRepostsReceived}</span>
                <span className="stat-label">Repost ricevuti</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.followers}</span>
                <span className="stat-label">Follower</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.following}</span>
                <span className="stat-label">Seguiti</span>
              </div>
            </div>
          )}
        </div>
        <div className="sidebar-card" style={{ marginTop: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            🌱 PiantaSocial • {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </div>
  )
}