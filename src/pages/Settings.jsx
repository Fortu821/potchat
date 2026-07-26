// src/pages/Settings.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetPassword, setResetPassword] = useState('')
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetting, setResetting] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // ----- RESET PASSWORD -----
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetPassword || resetPassword.length < 6) {
      setResetError('La password deve essere di almeno 6 caratteri')
      return
    }
    if (resetPassword !== resetPasswordConfirm) {
      setResetError('Le password non coincidono')
      return
    }

    setResetting(true)
    setResetError('')
    setResetSuccess(false)

    try {
      const { error } = await supabase.auth.updateUser({
        password: resetPassword
      })
      if (error) throw error
      setResetSuccess(true)
      setResetPassword('')
      setResetPasswordConfirm('')
      setTimeout(() => {
        setShowResetPassword(false)
        setResetSuccess(false)
      }, 3000)
    } catch (err) {
      setResetError(err.message || 'Errore durante il cambio password')
    } finally {
      setResetting(false)
    }
  }

  // ----- DELETE ACCOUNT -----
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINA') {
      setDeleteError('Devi scrivere "ELIMINA" per confermare')
      return
    }

    setDeleting(true)
    setDeleteError('')

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) throw profileError

      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      if (authError) throw authError

      await signOut()
      navigate('/login?deleted=true')
    } catch (err) {
      console.error('❌ Errore cancellazione:', err)
      setDeleteError('Errore durante la cancellazione dell\'account. Contattaci a potchat.social@proton.me')
      setDeleting(false)
    }
  }

  if (!user) {
    return (
      <div className="app-container" style={{ maxWidth: '560px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
        <h2>Devi essere loggato</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Accedi per visualizzare le impostazioni.</p>
        <Link to="/login" className="btn btn-primary">Accedi</Link>
      </div>
    )
  }

  return (
    <div className="app-container" style={{ maxWidth: '560px', margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link to="/" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>←</Link>
        <h1 style={{ margin: 0 }}>⚙️ Impostazioni</h1>
      </div>

      {/* SEZIONE ACCOUNT */}
      <div className="settings-card">
        <h3>👤 Account</h3>
        <div className="settings-list">
          <Link to={`/profile/${user.username}`} className="settings-item">
            <span>👤</span>
            <span>Il mio profilo</span>
            <span className="settings-arrow">→</span>
          </Link>
          <button onClick={signOut} className="settings-item settings-item-danger">
            <span>🚪</span>
            <span>Logout</span>
            <span className="settings-arrow">→</span>
          </button>
        </div>
      </div>

      {/* SEZIONE SICUREZZA */}
      <div className="settings-card">
        <h3>🔐 Sicurezza</h3>
        <div className="settings-list">
          <button
            onClick={() => setShowResetPassword(!showResetPassword)}
            className="settings-item"
          >
            <span>🔑</span>
            <span>Cambia password</span>
            <span className="settings-arrow">{showResetPassword ? '−' : '+'}</span>
          </button>
          {showResetPassword && (
            <form onSubmit={handleResetPassword} className="settings-form">
              <div className="settings-form-group">
                <label>Nuova password</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Almeno 6 caratteri"
                  className="input"
                  required
                />
              </div>
              <div className="settings-form-group">
                <label>Conferma password</label>
                <input
                  type="password"
                  value={resetPasswordConfirm}
                  onChange={(e) => setResetPasswordConfirm(e.target.value)}
                  placeholder="Ripeti la password"
                  className="input"
                  required
                />
              </div>
              {resetError && <p className="settings-error">{resetError}</p>}
              {resetSuccess && <p className="settings-success">✅ Password aggiornata!</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" disabled={resetting} className="btn btn-primary">
                  {resetting ? '⏳...' : '💾 Salva'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false)
                    setResetError('')
                    setResetSuccess(false)
                  }}
                  className="btn btn-outline"
                >
                  Annulla
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* SEZIONE DATI */}
      <div className="settings-card">
        <h3>🗑️ Dati</h3>
        <div className="settings-list">
          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="settings-item settings-item-danger"
          >
            <span>⚠️</span>
            <span>Elimina account</span>
            <span className="settings-arrow">{showDeleteConfirm ? '−' : '+'}</span>
          </button>
          {showDeleteConfirm && (
            <div className="settings-form">
              <p className="settings-warning">
                ⚠️ Questa operazione è <strong>irreversibile</strong>. Tutti i tuoi dati (post, commenti, like, chat, profilo) verranno eliminati definitivamente.
              </p>
              <div className="settings-form-group">
                <label>Digita <strong>ELIMINA</strong> per confermare</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="ELIMINA"
                  className="input"
                />
              </div>
              {deleteError && <p className="settings-error">{deleteError}</p>}
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="btn btn-danger"
                style={{ width: '100%' }}
              >
                {deleting ? '⏳ Eliminazione...' : '🗑️ Elimina definitivamente'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SEZIONE LEGALE */}
      <div className="settings-card">
        <h3>📜 Legale</h3>
        <div className="settings-list">
          <Link to="/settings/terms" className="settings-item">
            <span>📜</span>
            <span>Termini di Servizio</span>
            <span className="settings-arrow">→</span>
          </Link>
          <Link to="/settings/privacy" className="settings-item">
            <span>🔒</span>
            <span>Privacy Policy</span>
            <span className="settings-arrow">→</span>
          </Link>
          <Link to="/settings/cookies" className="settings-item">
            <span>🍪</span>
            <span>Cookie Policy</span>
            <span className="settings-arrow">→</span>
          </Link>
          <Link to="/settings/legal" className="settings-item">
            <span>📄</span>
            <span>Documento legale completo</span>
            <span className="settings-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* SEZIONE SUPPORTO */}
      <div className="settings-card">
        <h3>💬 Supporto</h3>
        <div className="settings-list">
          <Link to="/settings/feedback" className="settings-item">
            <span>📣</span>
            <span>Invia feedback</span>
            <span className="settings-arrow">→</span>
          </Link>
          <Link to="/settings/contact" className="settings-item">
            <span>📧</span>
            <span>Contattaci</span>
            <span className="settings-arrow">→</span>
          </Link>
          <Link to="/collaborate" className="settings-item">
            <span>🤝</span>
            <span>Collabora</span>
            <span className="settings-arrow">→</span>
          </Link>

        </div>
      </div>

      <div className="settings-footer">
        <p>🌱 PotChat v1.0 • {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}