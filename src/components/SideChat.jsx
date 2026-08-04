import React, { useState } from 'react';
import { MessageCircle, X, Video, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SideChat.css';

const SideChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can we help you today?', sender: 'agent' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    const newMsg = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages([...messages, newMsg]);
    setInputValue('');
    
    // Simulate auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev, 
        { id: Date.now(), text: 'Thank you for reaching out. We will get back to you shortly.', sender: 'agent' }
      ]);
    }, 1000);
  };

  const handleVideoCall = () => {
    navigate('/swap-call');
  };

  return (
    <div className="side-chat-container">
      {isOpen && (
        <div className="side-chat-window">
          <div className="side-chat-header">
            <h4>Support Chat</h4>
            <div className="header-actions">
              <button className="video-call-btn" onClick={handleVideoCall} title="Random Video Chat">
                <Video size={16} />
              </button>
              <button className="close-btn" onClick={toggleChat} title="Close Chat">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="side-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <form className="side-chat-input" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
      {!isOpen && (
        <button className="side-chat-toggle" onClick={toggleChat}>
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default SideChat;
