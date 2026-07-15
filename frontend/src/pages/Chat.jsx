import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, User, Search, RefreshCw } from 'lucide-react';

const Chat = () => {
  const { user, token } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch threads on load
  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
        // If there is no active partner but threads exist, load the first one
        if (!selectedPartner && data.length > 0) {
          setSelectedPartner(data[0].partner);
        }
      }
    } catch (err) {
      console.error('Error fetching chat threads:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Fetch chat history with selected partner
  const fetchChatHistory = async (partnerId) => {
    if (!partnerId) return;
    try {
      const res = await fetch(`/api/messages/${partnerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchThreads();
  }, [token]);

  // Handle auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history when selected partner changes
  useEffect(() => {
    if (!selectedPartner) return;
    setLoadingHistory(true);
    fetchChatHistory(selectedPartner.id).then(() => setLoadingHistory(false));
  }, [selectedPartner]);

  // Polling loop (every 3 seconds) for real-time simulation
  useEffect(() => {
    if (!token || !selectedPartner) return;
    const interval = setInterval(() => {
      fetchChatHistory(selectedPartner.id);
      fetchThreads(); // refresh previews too
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedPartner, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPartner) return;
    
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedPartner.id,
          content: textToSend
        })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        // Refresh threads to update preview
        fetchThreads();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loadingThreads && threads.length === 0) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        Loading messaging workspace...
      </div>
    );
  }

  return (
    <div className="page-container fade-in" style={{ padding: '24px 16px' }}>
      <div 
        className="glass" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '320px 1fr', 
          height: 'calc(100vh - 160px)', 
          borderRadius: 'var(--radius-lg)', 
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Left Side: Threads Panel */}
        <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Conversations</h3>
            <button 
              onClick={() => { fetchThreads(); if (selectedPartner) fetchChatHistory(selectedPartner.id); }} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
              title="Refresh Messages"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {threads.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <MessageSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                No active conversations yet. Visit search to message landlords/agents.
              </div>
            ) : (
              threads.map(t => {
                const isActive = selectedPartner && selectedPartner.id === t.partner.id;
                return (
                  <div 
                    key={t.partnerId}
                    onClick={() => setSelectedPartner(t.partner)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                      transition: 'background-color var(--transition-fast)',
                      marginBottom: '6px'
                    }}
                  >
                    <div className="gradient-bg" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                      {t.partner.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isActive ? 'var(--accent-color)' : 'var(--text-primary)' }}>{t.partner.name}</span>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          textTransform: 'capitalize', 
                          backgroundColor: 'var(--bg-tertiary)', 
                          padding: '2px 6px', 
                          borderRadius: '8px',
                          color: 'var(--text-secondary)'
                        }}>
                          {t.partner.role}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--text-secondary)', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        marginTop: '4px' 
                      }}>
                        {t.lastMessage.senderId === user.id ? 'You: ' : ''}{t.lastMessage.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Box */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
          {selectedPartner ? (
            <>
              {/* Partner Header */}
              <div 
                style={{ 
                  padding: '16px 24px', 
                  borderBottom: '1px solid var(--border-color)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <div className="gradient-bg" style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                  {selectedPartner.name.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedPartner.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {selectedPartner.role} • {selectedPartner.email}
                  </span>
                </div>
              </div>

              {/* Chat History */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {loadingHistory ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Loading messages...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {messages.map(msg => {
                      const isMe = msg.senderId === user.id;
                      return (
                        <div 
                          key={msg.id}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div 
                            style={{
                              backgroundColor: isMe ? 'var(--accent-color)' : 'var(--bg-secondary)',
                              color: isMe ? 'white' : 'var(--text-primary)',
                              padding: '12px 18px',
                              borderRadius: isMe ? '18px 18px 0 18px' : '0 18px 18px 18px',
                              fontSize: '0.9rem',
                              border: isMe ? 'none' : '1px solid var(--border-color)',
                              boxShadow: 'var(--shadow-sm)',
                              lineBreak: 'strict'
                            }}
                          >
                            {msg.content}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={handleSendMessage}
                style={{ 
                  padding: '16px 24px', 
                  borderTop: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <input 
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`Write a message to ${selectedPartner.name}...`}
                  style={{
                    flex: 1,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 18px',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)' }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              <MessageSquare size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3>Direct Messaging Center</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '6px', maxWidth: '300px', textAlign: 'center' }}>
                Select a thread from the left list, or contact a listing agent to launch a discussion.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
