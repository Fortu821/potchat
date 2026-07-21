// src/pages/Moderation.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  pending: '#f39c12',
  reviewed: '#3498db',
  dismissed: '#95a5a6',
  action_taken: '#e74c3c'
}

const REASON_LABELS = {
  spam: '📧 Spam',
  harassment: '😤 Molestie',
  hate_speech: '🚫 Discorso d\'odio',
  inappropriate_content: '🔞 Contenuto inappropriato',
  misinformation: '📰 Disinformazione',
  other: '📌 Altro'
}

export default function Moderation() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchReports()
  }, [filter])

  async function fetchReports() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:reporter_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          reviewer:reviewed_by (
            id,
            username,
            display_name
          )
        `)
        .eq('status', filter)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (err) {
      console.error('❌ Errore caricamento segnalazioni:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(reportId, status, actionTaken = null) {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          action_taken: actionTaken
        })
        .eq('id', reportId)

      if (error) throw error
      await fetchReports()
    } catch (err) {
      console.error('❌ Errore aggiornamento:', err)
    }
  }

  if (loading) {
    return (
      <div className="app-container text-center" style={{ paddingTop: '60px' }}>
        <div className="text-muted">⏳ Caricamento segnalazioni...</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🚩 Pannello di moderazione</h2>
        <Link to="/" className="btn btn-secondary btn-sm">← Home</Link>
      </div>

      <div className="filter-bar">
        {['pending', 'reviewed', 'dismissed', 'action_taken'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`filter-btn ${filter === status ? 'active-recent' : ''}`}
            style={{
              background: filter === status ? STATUS_COLORS[status] : 'transparent',
              color: filter === status ? 'white' : 'var(--color-text-secondary)',
              borderColor: filter === status ? STATUS_COLORS[status] : 'var(--color-border)'
            }}
          >
            {status.replace('_', ' ').toUpperCase()}
            {reports.length > 0 && ` (${reports.length})`}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">📭</span>
          <h3>Nessuna segnalazione {filter}</h3>
        </div>
      ) : (
        reports.map(report => (
          <div key={report.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong>{REASON_LABELS[report.reason] || report.reason}</strong>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    background: STATUS_COLORS[report.status],
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
                    onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                    className="btn btn-secondary btn-sm"
                  >
                    👁️ Reviewed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                    className="btn btn-outline btn-sm"
                  >
                    ❌ Dismiss
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'action_taken', 'Contenuto rimosso')}
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
    </div>
  )
}