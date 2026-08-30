import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, BrainCircuit, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I'm your BuildNexus AI Assistant. I have real-time access to the factory floor. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ai/ask`, { question: userMessage });
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.data.answer 
      }]);
    } catch (err) {
      console.error("AI request failed", err);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Sorry, I am having trouble connecting to my servers right now." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="header-actions" style={{ marginBottom: '1rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BrainCircuit color="var(--ai)" />
          AI Assistant
        </h1>
        <p>Ask questions about your factory. The AI is grounded with live data.</p>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        {/* Chat History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' 
              }}
            >
              <div 
                style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: msg.role === 'user' ? '#e2e8f0' : 'var(--ai)',
                  color: msg.role === 'user' ? '#475569' : 'white',
                  flexShrink: 0
                }}
              >
                {msg.role === 'user' ? <User size={20} /> : <BrainCircuit size={20} />}
              </div>
              
              <div 
                style={{ 
                  maxWidth: '75%',
                  padding: '1rem', 
                  borderRadius: '12px',
                  backgroundColor: msg.role === 'user' ? '#f1f5f9' : '#ede9fe',
                  color: 'var(--text-main)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--border-light)' : '#ddd6fe'}`,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--ai)', color: 'white' }}>
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#ede9fe', color: 'var(--text-main)', border: '1px solid #ddd6fe' }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', backgroundColor: '#f8fafc' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about live energy costs, machine statuses..."
              style={{ 
                flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)',
                fontSize: '1rem', outline: 'none'
              }}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn btn-ai" 
              disabled={loading || !input.trim()}
              style={{ padding: '0 1.5rem', borderRadius: '8px' }}
            >
              <Send size={20} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
