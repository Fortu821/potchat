// src/utils/textParser.js
import { Link } from 'react-router-dom'

export function parseText(text) {
  if (!text) return null

  const mentionRegex = /@(\w+)/g
  const hashtagRegex = /#(\w+)/g

  const tokens = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    tokens.push({
      index: match.index,
      end: match.index + match[0].length,
      value: match[1],
      type: 'mention',
      full: match[0]
    })
  }

  while ((match = hashtagRegex.exec(text)) !== null) {
    tokens.push({
      index: match.index,
      end: match.index + match[0].length,
      value: match[1],
      type: 'hashtag',
      full: match[0]
    })
  }

  tokens.sort((a, b) => a.index - b.index)

  if (tokens.length === 0) return text

  const result = []
  let currentIndex = 0

  tokens.forEach((token) => {
    if (token.index > currentIndex) {
      result.push(text.slice(currentIndex, token.index))
    }

    if (token.type === 'mention') {
      result.push(
        <Link
          key={`mention-${token.index}`}
          to={`/profile/${token.value}`}
          style={{ color: 'var(--color-secondary)', fontWeight: '500', textDecoration: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          @{token.value}
        </Link>
      )
    } else if (token.type === 'hashtag') {
      result.push(
        <Link
          key={`hashtag-${token.index}`}
          to={`/search?q=${encodeURIComponent(token.value)}`}
          style={{ color: 'var(--color-primary)', fontWeight: '500', textDecoration: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          #{token.value}
        </Link>
      )
    }

    currentIndex = token.end
  })

  if (currentIndex < text.length) {
    result.push(text.slice(currentIndex))
  }

  return result
}