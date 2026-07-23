// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import NotificationsPage from './pages/NotificationsPage'
import Chats from './pages/Chats'
import Chat from './pages/Chat'
import Search from './pages/Search'
import ResetPassword from './pages/ResetPassword'
import Feedback from './pages/Feedback'
import WelcomeModal from './components/WelcomeModal'
import Followers from './pages/Followers'
import Following from './pages/Following'

function App() {
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem('potchat_welcome_seen')
    if (!hasSeen) {
      setShowWelcome(true)
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        {showWelcome && (
          <WelcomeModal onClose={() => setShowWelcome(false)} />
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/profile/:username/followers" element={<Followers />} />
          <Route path="/profile/:username/following" element={<Following />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/search" element={<Search />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App