// src/pages/Chats.jsx
import ChatList from '../components/ChatList'
import { Link } from 'react-router-dom'

export default function Chats() {
  return (
    <div className="chats-page">
      <div className="chats-header">
        <h2>💬 Messaggi</h2>
        <Link to="/" className="btn btn-secondary btn-sm">← Home</Link>
      </div>
      <ChatList />
    </div>
  )
}