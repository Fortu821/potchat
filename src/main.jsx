// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Gestione tema scuro
const storedTheme = localStorage.getItem('theme') || 'light'
document.documentElement.setAttribute('data-theme', storedTheme)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)