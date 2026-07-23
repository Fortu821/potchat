// src/pages/Followers.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Followers() {
  const { username } = useParams()
  const [followers, setFollowers] = useState([])
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

        const { data: followersData, error: followersError } = await supabase
          .from('follows')
          .select(`
            follower_id,
            profiles:follower_id (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('followed_id', profileData.id)
          .order('created_at', { ascending: false })

        if (followersError) throw followersError

        const followersList = followersData.map(item => item.profiles).filter(Boolean)
        setFollowers(followersList)

      } catch (err) {
        console.error('❌ Errore caricamento follower:', err)
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
        <h2 style={{ margin: 0 }}>👥 Follower di @{profile.username}</h2>
      </div>

      {followers.length === 0 ? (
        <p className="text-muted">Nessun follower.</p>
      ) : (
        <div>
          {followers.map((follower) => (
            <Link
              key={follower.id}
              to={`/profile/${follower.username}`}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', marginBottom: '8px' }}
            >
              {follower.avatar_url ? (
                <img src={follower.avatar_url} alt={follower.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌱</div>
              )}
              <div>
                <div className="card-author">{follower.display_name || follower.username}</div>
                <div className="card-username">@{follower.username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}