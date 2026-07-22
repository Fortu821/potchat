// src/pages/Profile.jsx
import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef(null)

  useEffect(() => {
    if (username === 'me' && !user) {
      setLoading(false)
      setError('non_loggato')
      return
    }

    if (username === 'me' && user) {
      navigate(`/profile/${user.username}`, { replace: true })
      return
    }

    fetchProfile()
  }, [username, user])

  async function fetchProfile() {
    setLoading(true)
    setError(null)

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError) throw profileError
      if (!profileData) {
        setError('Utente non trovato')
        setLoading(false)
        return
      }

      setProfile(profileData)
      setIsOwnProfile(user?.id === profileData.id)

      const { data: postsData, error: postsError } = await supabase
        .from('posts_with_counts')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })

      if (postsError) throw postsError
      setPosts(postsData || [])

      const { count: followers, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', profileData.id)

      if (!followersError) setFollowersCount(followers || 0)

      const { count: following, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileData.id)

      if (!followingError) setFollowingCount(following || 0)

      if (user && user.id !== profileData.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('followed_id', profileData.id)
          .maybeSingle()

        setIsFollowing(!!followData)
      }

      setEditDisplayName(profileData.display_name || '')
      setEditBio(profileData.bio || '')
      setEditAvatarUrl(profileData.avatar_url || '')

    } catch (err) {
      console.error('❌ Errore:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ----- UPLOAD AVATAR -----
  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Seleziona un\'immagine valida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'immagine non deve superare i 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `avatars/${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const avatarUrl = urlData.publicUrl

      // Aggiorna il profilo
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setEditAvatarUrl(avatarUrl)
      setProfile({ ...profile, avatar_url: avatarUrl })
      alert('✅ Avatar aggiornato!')

    } catch (err) {
      console.error('❌ Errore upload avatar:', err)
      alert('Errore durante il caricamento dell\'avatar')
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  // ----- SEGUI -----
  async function handleFollow() {
    if (!user) {
      alert('Devi essere loggato per seguire')
      return
    }
    if (!profile || isOwnProfile) return

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', profile.id)

        if (error) throw error
        setIsFollowing(false)
        setFollowersCount(prev => Math.max(0, prev - 1))
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, followed_id: profile.id })

        if (error) throw error
        setIsFollowing(true)
        setFollowersCount(prev => prev + 1)
      }
    } catch (err) {
      console.error('❌ Errore follow:', err)
      alert('Errore nell\'operazione')
    }
  }

  // ----- AVVIA CHAT -----
  async function startChat() {
    if (!user) {
      alert('Devi essere loggato per messaggiare')
      return
    }
    if (!profile) return

    try {
      const { data, error } = await supabase
        .rpc('get_or_create_conversation', {
          user1_id: user.id,
          user2_id: profile.id
        })

      if (error) throw error
      navigate(`/chat/${data}`)
    } catch (err) {
      console.error('❌ Errore avvio chat:', err)
      alert('Errore nell\'avvio della chat')
    }
  }

  // ----- SALVA MODIFICHE -----
  async function handleSaveProfile(e) {
    e.preventDefault()
    if (!user || user.id !== profile.id) return

    // ✅ CONFERMA
    if (!confirm('✏️ Sei sicuro di voler salvare le modifiche al profilo?')) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editDisplayName.trim() || null,
          bio: editBio.trim() || null,
          avatar_url: editAvatarUrl.trim() || null
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({
        ...profile,
        display_name: editDisplayName.trim() || null,
        bio: editBio.trim() || null,
        avatar_url: editAvatarUrl.trim() || null
      })

      setIsEditing(false)
      alert('✅ Profilo aggiornato!')
    } catch (err) {
      console.error('❌ Errore salvataggio:', err)
      alert('Errore nel salvataggio del profilo')
    } finally {
      setIsSaving(false)
    }
  }

  // ----- RENDER -----
  if (loading) {
    return <div className="app-container text-center" style={{ paddingTop: '60px' }}>⏳ Caricamento...</div>
  }

  if (error === 'non_loggato') {
    return (
      <div className="app-container" style={{ maxWidth: '400px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
        <h2>Non sei loggato!</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Accedi o registrati per visualizzare il tuo profilo.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-primary">Accedi</Link>
          <Link to="/signup" className="btn btn-secondary">Registrati</Link>
        </div>
        <p style={{ marginTop: '20px' }}>
          <Link to="/">← Torna alla home</Link>
        </p>
      </div>
    )
  }

  if (error) {
    return <div className="app-container text-center" style={{ paddingTop: '60px', color: 'var(--color-danger)' }}>❌ {error}</div>
  }

  if (!profile) {
    return <div className="app-container text-center" style={{ paddingTop: '60px' }}>👤 Utente non trovato</div>
  }

  return (
    <div className="app-container">
      <div className="profile-header">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="avatar-large" />
          ) : (
            <div className="avatar-large-placeholder">🌱</div>
          )}
          {isOwnProfile && (
            <>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
                disabled={isUploadingAvatar}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  padding: '0',
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow-md)'
                }}
                disabled={isUploadingAvatar}
                title="Cambia avatar"
              >
                {isUploadingAvatar ? '⏳' : '📷'}
              </button>
            </>
          )}
        </div>

        <h2 className="profile-name">{profile.display_name || profile.username}</h2>
        <p className="profile-username">@{profile.username}</p>

        {profile.bio && <p className="profile-bio">{profile.bio}</p>}

        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Iscritto il {new Date(profile.created_at).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="profile-stats">
          <div className="profile-stats-item">
            <span className="number">{posts.length}</span>
            <span className="label">post</span>
          </div>
          <div className="profile-stats-item">
            <span className="number">{followersCount}</span>
            <span className="label">follower</span>
          </div>
          <div className="profile-stats-item">
            <span className="number">{followingCount}</span>
            <span className="label">seguiti</span>
          </div>
        </div>

        <div className="profile-actions">
          {isOwnProfile ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary"
            >
              {isEditing ? '✕ Annulla' : '✏️ Modifica profilo'}
            </button>
          ) : (
            <>
              <button
                onClick={handleFollow}
                className={`btn ${isFollowing ? 'btn-danger' : 'btn-success'}`}
                disabled={!user}
                style={{ opacity: user ? 1 : 0.6 }}
              >
                {isFollowing ? '❌ Smetti di seguire' : '➕ Segui'}
              </button>
              <button
                onClick={startChat}
                className="btn btn-secondary"
                disabled={!user}
                style={{ opacity: user ? 1 : 0.6 }}
              >
                💬 Messaggio
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing && isOwnProfile && (
        <form onSubmit={handleSaveProfile} className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0 }}>✏️ Modifica profilo</h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Nome visualizzato
            </label>
            <input
              type="text"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              placeholder="Il tuo nome"
              className="input"
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Bio
            </label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Parla di te..."
              rows={3}
              className="textarea"
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              URL avatar
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={editAvatarUrl}
                onChange={(e) => setEditAvatarUrl(e.target.value)}
                placeholder="https://esempio.com/avatar.jpg"
                className="input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? '⏳' : '📷 Carica'}
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Puoi caricare un'immagine o inserire un URL.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={isSaving} className="btn btn-success">
              {isSaving ? '⏳ Salvataggio...' : '💾 Salva'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-danger">
              Annulla
            </button>
          </div>
        </form>
      )}

      <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
        📝 Post di {profile.display_name || profile.username}
      </h3>

      {posts.length === 0 ? (
        <div className="empty-state" style={{ padding: '20px 0' }}>
          <p className="text-muted">
            {isOwnProfile ? 'Non hai ancora pubblicato nulla.' : 'Questo utente non ha ancora pubblicato.'}
          </p>
        </div>
      ) : (
        posts.map((post) => {
          let mediaType = post.media_type
          if (post.media_url && !mediaType) {
            if (post.media_url.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
              mediaType = 'video'
            } else {
              mediaType = 'image'
            }
          }

          return (
            <div key={post.id} className="card">
              <p style={{ margin: '0 0 8px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {post.content}
              </p>

              {post.media_url && (
                <div className="post-media" style={{ marginTop: '8px' }}>
                  {mediaType === 'video' ? (
                    <video
                      src={post.media_url}
                      controls
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

              <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                <span>❤️ {post.likes_count || 0}</span>
                <span>💬 {post.comments_count || 0}</span>
                <span>🔄 {post.reposts_count || 0}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                  {new Date(post.created_at).toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          )
        })
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/" className="btn btn-secondary btn-sm">← Torna alla home</Link>
      </div>
    </div>
  )
}