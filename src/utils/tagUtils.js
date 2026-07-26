export const TAG_CONFIG = {
  staff: {
    label: 'Staff Member',
    icon: '🛠️',
    color: '#f39c12',
    visibility: 'public',
    order: 0
  },
  moderator: {
    label: 'Moderator',
    icon: '🛡️',
    color: '#3498db',
    visibility: 'public',
    order: 1
  },
  official: {
    label: 'Official Account',
    icon: '⭐',
    color: '#8e44ad',
    visibility: 'public',
    order: 2
  },
  beta_tester: {
    label: 'Beta Tester',
    icon: '🧪',
    color: '#2ecc71',
    visibility: 'profile_only',
    order: 3
  }
}

export const BLOCKED_TAG = {
  label: 'Bloccato',
  icon: '🚫',
  color: '#e74c3c',
  visibility: 'staff_only',
  order: 4
}

export function getUserTags(user, currentUser) {
  if (!user) return []

  const tags = []

  // Ruolo -> tag (solo se è uno dei ruoli speciali)
  if (user.role === 'staff') {
    tags.push({ ...TAG_CONFIG.staff, key: 'staff' })
  } else if (user.role === 'moderator') {
    tags.push({ ...TAG_CONFIG.moderator, key: 'moderator' })
  } else if (user.role === 'official') {
    tags.push({ ...TAG_CONFIG.official, key: 'official' })
  } else if (user.role === 'beta_tester') {
    tags.push({ ...TAG_CONFIG.beta_tester, key: 'beta_tester' })
  }

  // Bloccato è sempre un tag separato (se l'utente è bloccato)
  if (user.blocked) {
    tags.push({ ...BLOCKED_TAG, key: 'blocked' })
  }

  // Filtra per visibilità
  const filteredTags = tags.filter(tag => {
    if (tag.visibility === 'public') return true
    if (tag.visibility === 'profile_only') return true
    if (tag.visibility === 'staff_only') {
      return currentUser && (currentUser.role === 'staff' || currentUser.role === 'moderator')
    }
    return false
  })

  return filteredTags
}

export function getPublicTags(user) {
  if (!user) return []

  const tags = []

  if (user.role === 'staff') {
    tags.push({ ...TAG_CONFIG.staff, key: 'staff' })
  } else if (user.role === 'moderator') {
    tags.push({ ...TAG_CONFIG.moderator, key: 'moderator' })
  } else if (user.role === 'official') {
    tags.push({ ...TAG_CONFIG.official, key: 'official' })
  }

  return tags
}

export function getDisplayRole(role) {
  if (!role) return 'Nessuno'
  const config = TAG_CONFIG[role]
  if (config) return `${config.icon} ${config.label}`
  return role
}