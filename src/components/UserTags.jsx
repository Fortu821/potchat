// src/components/UserTags.jsx
import { getUserTags } from '../utils/tagUtils'

export default function UserTags({ user, currentUser, showProfileTags = false, className = '' }) {
  const tags = getUserTags(user, currentUser)

  // Filtra i tag per visibilità profilo
  const visibleTags = showProfileTags
    ? tags
    : tags.filter(t => t.visibility === 'public' || t.visibility === 'staff_only')

  if (visibleTags.length === 0) return null

  return (
    <div className={`user-tags ${className}`} style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
      {visibleTags.map(tag => (
        <span
          key={tag.key}
          className="user-tag"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            padding: '1px 8px',
            borderRadius: '12px',
            fontSize: '0.65rem',
            fontWeight: '600',
            backgroundColor: tag.color,
            color: 'white',
            lineHeight: '1.6',
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}
          title={tag.label}
        >
          {tag.icon} {tag.label}
        </span>
      ))}
    </div>
  )
}