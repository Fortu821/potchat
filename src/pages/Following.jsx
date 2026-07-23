// src/pages/Following.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Following() {
  const { username } = useParams()
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .eq('username', username)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        const { data: followingData, error: followingError } = await supabase
          .from('follows')
          .select(`
            followed_id,
            profiles:followed_id (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('follower_id', profileData.id)
          .order('created_at', { ascending: false })

        if (followingError) throw followingError

        const followingList = followingData.map(item => item.profiles).filter(Boolean)
        setFollowing(followingList)

      } catch (err) {
        console.error('❌ Errore caricamento seguiti:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (username) fetchData()
  }, [username])

  if (loading) return <div className="app-container text-center" style={{ paddingTop: '60px' }}>⏳ Caricamento...</div>
  if (error) return <div className="app-container text-center" style={{ paddingTop: '60px', color: 'var(--color-danger)' }}>❌ {error}</div>
  if (!profile) return <div className="app-container text-center" style={{ paddingTop: '60px' }}>Utente non trovato</div>

  return (
    <div className="app-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <Link to={`/profile/${profile.username}`} style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h2 style={{ margin: 0 }}>👥 @{profile.username} segue</h2>
      </div>

      {following.length === 0 ? (
        <p className="text-muted">Non segue nessuno.</p>
      ) : (
        <div>
          {following.map((followed) => (
            <Link
              key={followed.id}
              to={`/profile/${followed.username}`}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', marginBottom: '8px' }}
            >
              {followed.avatar_url ? (
                <img src={followed.avatar_url} alt={followed.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌱</div>
              )}
              <div>
                <div className="card-author">{followed.display_name || followed.username}</div>
                <div className="card-username">@{followed.username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}