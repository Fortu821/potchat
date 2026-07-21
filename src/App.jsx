// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import NotificationsPage from './pages/NotificationsPage'
import Chats from './pages/Chats'
import Chat from './pages/Chat'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App