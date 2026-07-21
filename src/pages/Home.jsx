// src/pages/Home.jsx
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Comments from '../components/Comments'
import ThemeToggle from '../components/ThemeToggle'

export default function Home() {
  const { user, signOut } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('recent')

  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentingPostId, setCommentingPostId] = useState(null)

  // STATS
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikesReceived: 0,
    totalCommentsReceived: 0,
    totalRepostsReceived: 0,
    followers: 0,
    following: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // ----- CARICA POST -----
  useEffect(() => {
    fetchPosts(filter)
  }, [filter])

  async function fetchPosts(selectedFilter) {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from('posts_with_counts').select('*')

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
      setPosts(data || [])
    } catch (err) {
      console.error('❌ Errore nel caricamento dei post:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ----- CARICA STATS PERSONALI -----
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
    await fetchPosts(filter)
  }

  // ----- CREA POST -----
  async function handleCreatePost(e) {
    e.preventDefault()
    if (!user) {
      alert('Devi essere loggato per pubblicare')
      return
    }
    if (!newPostContent.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: newPostContent.trim()
        })

      if (error) throw error

      setNewPostContent('')
      await refreshPosts()
    } catch (err) {
      console.error('❌ Errore nella pubblicazione:', err)
      alert('Errore nella pubblicazione del post')
    } finally {
      setIsSubmitting(false)
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
  if (loading) {
    return (
      <div className="app-container text-center" style={{ paddingTop: '60px' }}>
        <div className="text-muted">⏳ Caricamento...</div>
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
      {/* ========== SIDEBAR SINISTRA ========== */}
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

      {/* ========== FEED CENTRALE ========== */}
      <main className="feed-main">
        <div className="feed-header">
          <h2>📰 Feed</h2>
        </div>

        {/* FILTRI */}
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

        {/* CREAZIONE POST */}
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
                  placeholder="Cosa bolle in pentola? 🌱"
                  rows={3}
                  className="textarea"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newPostContent.trim()}
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

        {/* LISTA POST */}
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
          posts.map((post) => {
            const isLiked = post.is_liked_by_user || false
            const isReposted = post.is_reposted_by_user || false
            const isCommenting = commentingPostId === post.id

            return (
              <div key={post.id} className="card">
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

                <div className="card-content">{post.content}</div>

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
      </main>

      {/* ========== SIDEBAR DESTRA (STATS) ========== */}
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
              ⏳ Caricamento...
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