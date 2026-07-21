// src/components/ThemeToggle.jsx
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="theme-toggle"
      title={isDark ? 'Passa a tema chiaro' : 'Passa a tema scuro'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}