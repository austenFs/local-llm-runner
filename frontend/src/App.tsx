import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'system', 
      content: 'QWEN://TERMINAL v2.5 initialized...\nConnection established to Ollama instance.\nType your message to begin.', 
      timestamp: Date.now() 
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkConnection()
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkConnection = async () => {
    try {
      await axios.get('/api/tags')
      setIsConnected(true)
    } catch (error) {
      setIsConnected(false)
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'ERROR: Unable to connect to Ollama instance.\nCheck if the service is running.',
        timestamp: Date.now()
      }])
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Try RAG service first
      try {
        const ragResponse = await axios.post('http://localhost:8000/query', {
          query: input
        });
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: ragResponse.data.response,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        return;
      } catch (ragError) {
        // If RAG fails, fallback to direct Ollama
        console.log('RAG service not available, falling back to Ollama');
      }

      // Fallback to direct Ollama
      const response = await axios.post('/api/generate', {
        model: 'qwen2.5-coder',
        prompt: input,
        stream: false
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: 'system',
        content: `ERROR: ${error instanceof Error ? error.message : 'Failed to communicate with Ollama'}`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const clearTerminal = () => {
    setMessages([{
      role: 'system',
      content: 'Terminal cleared.\nQWEN://TERMINAL ready.',
      timestamp: Date.now()
    }])
  }

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="header-left">
          <div className="terminal-buttons">
            <span className="btn close"></span>
            <span className="btn minimize"></span>
            <span className="btn maximize"></span>
          </div>
          <span className="terminal-title">QWEN://TERMINAL</span>
        </div>
        <div className="header-right">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● ONLINE' : '○ OFFLINE'}
          </span>
          <button className="clear-btn" onClick={clearTerminal}>CLEAR</button>
        </div>
      </div>

      <div className="terminal-body">
        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <span className="timestamp">[{formatTimestamp(msg.timestamp)}]</span>
              <span className="role">
                {msg.role === 'user' ? 'USER@TERMINAL' : 
                 msg.role === 'assistant' ? 'QWEN://AI' : 
                 'SYSTEM'}
              </span>
              <span className="prompt-symbol">
                {msg.role === 'user' ? '>' : msg.role === 'assistant' ? '»' : '#'}
              </span>
              <span className="content">{msg.content}</span>
            </div>
          ))}
          {isLoading && (
            <div className="message loading">
              <span className="timestamp">[{formatTimestamp(Date.now())}]</span>
              <span className="role">QWEN://AI</span>
              <span className="prompt-symbol">»</span>
              <span className="content">
                <span className="loading-dots">Processing</span>
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="input-form">
          <span className="input-prompt">USER@TERMINAL {'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !isConnected}
            placeholder={isConnected ? "Enter command..." : "Waiting for connection..."}
            className="terminal-input"
          />
          <span className="cursor"></span>
        </form>
      </div>
    </div>
  )
}

export default App