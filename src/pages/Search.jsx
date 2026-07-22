// src/pages/Search.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!query || query.length < 2) {
      setUsers([])
      setPosts([])
      return
    }

    async function search() {
      setLoading(true)
      try {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(10)

        setUsers(usersData || [])

        const { data: postsData } = await supabase
          .from('posts_with_counts')
          .select('*')
          .ilike('content', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(20)

        setPosts(postsData || [])
      } catch (err) {
        console.error('❌ Errore ricerca:', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🔍 Ricerca</h2>
        <Link to="/" className="btn btn-secondary btn-sm">← Home</Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target)
          const q = formData.get('q')
          setSearchParams({ q })
        }}
        style={{ marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cerca utenti o post..."
            className="input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">🔍</button>
        </div>
      </form>

      {query && query.length < 2 && (
        <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
          Inserisci almeno 2 caratteri per cercare.
        </p>
      )}

      {query && query.length >= 2 && (
        <>
          <div className="filter-bar" style={{ marginBottom: '16px' }}>
            <button
              onClick={() => setActiveTab('all')}
              className={`filter-btn ${activeTab === 'all' ? 'active-recent' : ''}`}
            >
              Tutti ({users.length + posts.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`filter-btn ${activeTab === 'users' ? 'active-recent' : ''}`}
            >
              Utenti ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`filter-btn ${activeTab === 'posts' ? 'active-recent' : ''}`}
            >
              Post ({posts.length})
            </button>
          </div>

          {loading ? (
            <div className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>
              ⏳ Ricerca in corso...
            </div>
          ) : (
            <>
              {(activeTab === 'all' || activeTab === 'users') && (
                <>
                  {users.length === 0 ? (
                    <p className="text-muted">Nessun utente trovato</p>
                  ) : (
                    users.map(u => (
                      <Link
                        key={u.id}
                        to={`/profile/${u.username}`}
                        className="card"
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}
                      >
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.username} className="card-avatar" />
                        ) : (
                          <div className="card-avatar-placeholder">🌱</div>
                        )}
                        <div>
                          <div className="card-author">{u.display_name || u.username}</div>
                          <div className="card-username">@{u.username}</div>
                        </div>
                      </Link>
                    ))
                  )}
                </>
              )}

              {(activeTab === 'all' || activeTab === 'posts') && (
                <>
                  {activeTab === 'all' && users.length > 0 && posts.length > 0 && (
                    <hr style={{ margin: '16px 0', borderColor: 'var(--color-border)' }} />
                  )}
                  {posts.length === 0 ? (
                    <p className="text-muted">Nessun post trovato</p>
                  ) : (
                    posts.map(post => (
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
                              <span className="card-author">{post.display_name || post.username}</span>
                            </Link>
                            <Link to={`/profile/${post.username}`} className="card-username">
                              @{post.username}
                            </Link>
                          </div>
                        </div>
                        <div className="card-content">{post.content}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          ❤️ {post.likes_count || 0} • 💬 {post.comments_count || 0} • 🔄 {post.reposts_count || 0}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}