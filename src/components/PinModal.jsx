// src/components/PinModal.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function PinModal({ onConfirm, onCancel, action }) {
  const { user } = useAuth()
  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSettingPin, setIsSettingPin] = useState(false)

  const hasPin = user?.moderation_pin && user.moderation_pin.length > 0

  // ----- VERIFICA PIN -----
  const handleVerify = async (e) => {
    e.preventDefault()
    if (!pin || pin.length < 4) {
      setError('Inserisci un PIN di almeno 4 cifre')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (pin === user.moderation_pin) {
        await onConfirm()
        setPin('')
        setError('')
        onCancel()
      } else {
        setError('PIN errato. Riprova.')
        setPin('')
      }
    } catch (err) {
      setError('Errore durante la verifica del PIN')
    } finally {
      setLoading(false)
    }
  }

  // ----- IMPOSTA NUOVO PIN -----
  const handleSetPin = async (e) => {
    e.preventDefault()
    if (!newPin || newPin.length < 4) {
      setError('Il PIN deve essere di almeno 4 cifre')
      return
    }
    if (newPin !== confirmPin) {
      setError('I PIN non coincidono')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ moderation_pin: newPin })
        .eq('id', user.id)

      if (error) throw error

      user.moderation_pin = newPin
      setIsSettingPin(false)
      setNewPin('')
      setConfirmPin('')
      setError('')
      alert('✅ PIN impostato con successo! Ora inseriscilo per completare l\'azione.')
    } catch (err) {
      setError('Errore durante il salvataggio del PIN')
    } finally {
      setLoading(false)
    }
  }

  // ----- RENDER -----
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, textAlign: 'center' }}>
          {isSettingPin ? '🔑 Imposta PIN' : '🔐 PIN di moderazione'}
        </h3>

        {!hasPin && !isSettingPin ? (
          <>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Non hai ancora un PIN di moderazione.<br />
              Impostalo ora per {action || 'eseguire questa azione'}.
            </p>
            <button
              onClick={() => setIsSettingPin(true)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              🔑 Imposta PIN
            </button>
            <button
              onClick={onCancel}
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '8px' }}
            >
              Annulla
            </button>
          </>
        ) : isSettingPin ? (
          <form onSubmit={handleSetPin}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px' }}>
                Nuovo PIN (4-6 cifre)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Inserisci il PIN"
                className="input"
                style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '6px' }}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px' }}>
                Conferma PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Ripeti il PIN"
                className="input"
                style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '6px' }}
              />
            </div>
            {error && <p style={{ color: 'var(--color-danger)', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsSettingPin(false)
                  setNewPin('')
                  setConfirmPin('')
                  setError('')
                }}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading || newPin.length < 4 || newPin !== confirmPin}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {loading ? '⏳...' : '💾 Salva PIN'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Inserisci il tuo PIN per {action || 'eseguire questa azione'}.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Inserisci il tuo PIN"
                className="input"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }}
                autoFocus
              />
            </div>
            {error && <p style={{ color: 'var(--color-danger)', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {loading ? '⏳...' : '🔓 Conferma'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}