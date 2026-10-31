import React, { useState, useRef, useEffect } from 'react';
import type { EventModel } from '../../types/event';
import { askPlanningAssistant } from '../../services/aiService';
import {
  Sparkles,
  Send,
  X,
  Bot,
  Zap,
  TrendingDown,
  ListChecks,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface PlanningAssistantChatProps {
  currentEvent: EventModel;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  isLiveAI?: boolean;
}

export const PlanningAssistantChat: React.FC<PlanningAssistantChatProps> = ({
  currentEvent,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your **UtsavOS Planning Director**. I'm actively monitoring **${currentEvent.title}** (${currentEvent.domain}).

Ask me anything about your plan, or try one of the quick suggestions below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askPlanningAssistant(textToSend, currentEvent);
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAI: response.isLiveAI,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'I encountered an error retrieving advice. Please check your network and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="UtsavOS AI Planning Assistant Chat"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: isExpanded ? '600px' : '400px',
        maxWidth: 'calc(100vw - 32px)',
        height: isExpanded ? '720px' : '560px',
        maxHeight: 'calc(100vh - 48px)',
        backgroundColor: '#0c101d',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '18px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(245, 158, 11, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        transition: 'width 0.25s ease, height 0.25s ease',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(244, 63, 94, 0.12) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                Planning Assistant
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 700,
                }}
              >
                LIVE CONTEXT
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
              {currentEvent.title} • {currentEvent.currency} {currentEvent.totalBudget.toLocaleString()}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'Collapse chat drawer' : 'Expand chat drawer'}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '6px',
            }}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Planning Assistant"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Suggested Quick Prompts */}
      <div
        style={{
          padding: '0.6rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <button
          type="button"
          onClick={() => handleSendMessage('How do I cut 10% from my budget?')}
          style={{
            whiteSpace: 'nowrap',
            padding: '0.3rem 0.65rem',
            borderRadius: '9999px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            color: '#fde68a',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <TrendingDown size={12} />
          <span>Cut 10% from budget</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage('Review my vendor checklist and payment balances')}
          style={{
            whiteSpace: 'nowrap',
            padding: '0.3rem 0.65rem',
            borderRadius: '9999px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            color: '#c7d2fe',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <ListChecks size={12} />
          <span>Vendor checklist</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage('What are my next timeline priorities?')}
          style={{
            whiteSpace: 'nowrap',
            padding: '0.3rem 0.65rem',
            borderRadius: '9999px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            color: '#a7f3d0',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <Zap size={12} />
          <span>Next milestones</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        role="log"
        aria-live="polite"
        style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '88%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor:
                  msg.sender === 'user' ? '#4f46e5' : 'rgba(30, 41, 59, 0.75)',
                color: '#ffffff',
                fontSize: '0.86rem',
                lineHeight: 1.5,
                border:
                  msg.sender === 'user'
                    ? 'none'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                whiteSpace: 'pre-wrap',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              {msg.text}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.2rem' }}>
              {msg.timestamp}
              {msg.isLiveAI ? ' • Gemini 1.5' : ''}
            </span>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
            <Sparkles size={14} className="spin-icon" color="#f59e0b" />
            <span>Analyzing event context and calculating recommendations...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask e.g. 'How do I cut 10% from my budget?'..."
          aria-label="Planning assistant question"
          style={{
            flex: 1,
            backgroundColor: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '0.6rem 0.9rem',
            color: '#ffffff',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          aria-label="Send question to assistant"
          style={{
            backgroundColor: '#f59e0b',
            color: '#000000',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 0.9rem',
            cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
            opacity: inputValue.trim() && !isLoading ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}
        >
          <Send size={15} />
        </button>
      </form>
    </aside>
  );
};

