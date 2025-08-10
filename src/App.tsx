import { useState, useRef, useEffect } from "react";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import ReactMarkdown from 'react-markdown';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import "./App.css";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Generate a random 33-character session ID
const generateSessionId = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 33; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getWelcomeMessage = (): Message => ({
  id: "welcome",
  text: "Hello! I'm your AI assistant. How can I help you today?",
  isUser: false,
  timestamp: new Date()
});

// Function to get the Lambda function URL from Amplify outputs
const getLambdaFunctionUrl = (): string => {
  const config = Amplify.getConfig();
  // The function URL will be available in the custom outputs after deployment
  return (config as any).custom?.bedrockAgentStreamUrl || '';
};

// Function to make authenticated requests to Lambda Function URL
const makeAuthenticatedRequest = async (url: string, payload: any) => {
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;
    
    if (!credentials) {
      throw new Error('No credentials available. User must be authenticated.');
    }

    // For now, we'll use a simple fetch - in production you'd want proper AWS IAM signing
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.tokens?.accessToken?.toString()}`,
      },
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    console.error('Error making authenticated request:', error);
    throw error;
  }
};

function ChatApp() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);

  // Debug: Log session ID when it changes
  useEffect(() => {
    console.log("Session ID:", sessionId, "Length:", sessionId.length);
  }, [sessionId]);

  const handleNewChat = () => {
    // Generate new session ID
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    // Clear chat history and reset to welcome message
    setMessages([getWelcomeMessage()]);
    
    // Clear any ongoing streaming or loading states
    setStreamingResponse("");
    setIsLoading(false);
    
    // Clear input
    setPrompt("");
    
    console.log("New chat started with Session ID:", newSessionId);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: prompt,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);
    setStreamingResponse("");
    
    try {
      const functionUrl = getLambdaFunctionUrl();
      
      if (!functionUrl) {
        throw new Error('Lambda function URL not available. Please check your deployment.');
      }

      console.log("Sending request with payload:", {
        prompt: prompt,
        session_id: sessionId
      });

      const response = await makeAuthenticatedRequest(functionUrl, {
        prompt: prompt,
        session_id: sessionId
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setStreamingResponse(fullResponse);
        }

        // Add the complete response as a message
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: fullResponse,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setStreamingResponse("");
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `**Error:** ${error instanceof Error ? error.message : 'Failed to get response from AI'}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MarkdownMessage = ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        // Custom styling for code blocks
        code: ({ className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          return !isInline ? (
            <pre className="code-block">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code className="inline-code" {...props}>
              {children}
            </code>
          );
        },
        // Custom styling for blockquotes
        blockquote: ({ children }) => (
          <blockquote className="markdown-blockquote">
            {children}
          </blockquote>
        ),
        // Custom styling for lists
        ul: ({ children }) => (
          <ul className="markdown-list">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="markdown-list">
            {children}
          </ol>
        ),
        // Custom styling for headings
        h1: ({ children }) => <h1 className="markdown-heading">{children}</h1>,
        h2: ({ children }) => <h2 className="markdown-heading">{children}</h2>,
        h3: ({ children }) => <h3 className="markdown-heading">{children}</h3>,
        h4: ({ children }) => <h4 className="markdown-heading">{children}</h4>,
        h5: ({ children }) => <h5 className="markdown-heading">{children}</h5>,
        h6: ({ children }) => <h6 className="markdown-heading">{children}</h6>,
        // Custom styling for links
        a: ({ href, children }) => (
          <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        // Custom styling for tables
        table: ({ children }) => (
          <div className="table-wrapper">
            <table className="markdown-table">
              {children}
            </table>
          </div>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="app">
      <div className="chat-container">
        <header className="chat-header">
          <div className="header-content">
            <div className="ai-avatar">
              <div className="avatar-icon">🤖</div>
              <div className="status-indicator"></div>
            </div>
            <div className="header-text">
              <h1>AI Assistant</h1>
              <p>Powered by AWS • Authenticated • Markdown Support</p>
            </div>
            <button 
              className="new-chat-button"
              onClick={handleNewChat}
              disabled={isLoading}
              title="Start a new chat session"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20"/>
              </svg>
              New Chat
            </button>
          </div>
        </header>

        <div className="messages-container">
          <div className="messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-avatar">
                  {message.isUser ? (
                    <div className="user-avatar">👤</div>
                  ) : (
                    <div className="ai-avatar-small">🤖</div>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    {message.isUser ? (
                      <p>{message.text}</p>
                    ) : (
                      <MarkdownMessage content={message.text} />
                    )}
                  </div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {streamingResponse && (
              <div className="message ai-message streaming">
                <div className="message-avatar">
                  <div className="ai-avatar-small">🤖</div>
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    <MarkdownMessage content={streamingResponse} />
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading && !streamingResponse && (
              <div className="message ai-message">
                <div className="message-avatar">
                  <div className="ai-avatar-small">🤖</div>
                </div>
                <div className="message-content">
                  <div className="message-bubble loading">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form className="input-container" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... "
              className="message-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="send-button"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9"></polygon>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 16px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              Welcome, {user?.attributes?.name || user?.signInDetails?.loginId}
            </span>
            <button 
              onClick={signOut}
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
            >
              Sign out
            </button>
          </div>
          <ChatApp />
        </div>
      )}
    </Authenticator>
  );
}

export default App;
