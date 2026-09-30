import { useEffect, useRef, useState } from 'react'
import { FiMessageCircle, FiRotateCw, FiSend, FiX } from 'react-icons/fi'
import { api } from '../services/api.js'
import './Chatbot.css'

const WELCOME_MESSAGE = 'Hello. I can help with general questions, but I cannot access portal records or make changes.'

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [failedMessage, setFailedMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  async function sendMessage(content = draft, isRetry = false) {
    const text = content.trim()
    if (!text || isLoading) return

    setError('')
    if (!isRetry) {
      setFailedMessage('')
      setMessages((current) => [...current, { role: 'user', content: text }])
      setDraft('')
    }

    const conversation = isRetry ? messages : [...messages, { role: 'user', content: text }]
    setIsLoading(true)
    try {
      const history = conversation.slice(-20).map(({ role, content: message }) => ({ role, content: message }))
      const result = await api.chat(history)
      setMessages((current) => [...current, { role: 'assistant', content: result.reply }])
      setFailedMessage('')
    } catch (requestError) {
      setError(requestError.message || 'The assistant is temporarily unavailable. Please try again.')
      setFailedMessage(text)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage()
  }

  function handleInputKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chatbot">
      {isOpen && (
        <section className="chatbot-panel" role="dialog" aria-label="General questions assistant">
          <header className="chatbot-header">
            <span className="chatbot-header-icon"><FiMessageCircle /></span>
            <div className="chatbot-heading">
              <strong>Assistant</strong>
              <span>General questions · No portal access</span>
            </div>
            <button className="chatbot-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant" title="Close assistant">
              <FiX />
            </button>
          </header>

          <div className="chatbot-messages" aria-live="polite" aria-busy={isLoading}>
            {messages.length === 0 && <p className="chatbot-welcome">{WELCOME_MESSAGE}</p>}
            {messages.map((message, index) => (
              <p className={`chatbot-message chatbot-message-${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </p>
            ))}
            {isLoading && <p className="chatbot-loading"><span /> <span /> <span /><span className="chatbot-loading-label">Thinking</span></p>}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="chatbot-error" role="alert">
              <span>{error}</span>
              {failedMessage && (
                <button type="button" onClick={() => sendMessage(failedMessage, true)} disabled={isLoading}>
                  <FiRotateCw /> Retry
                </button>
              )}
            </div>
          )}

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <textarea
              aria-label="Your message"
              maxLength={4000}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask a general question..."
              rows={1}
              value={draft}
              disabled={isLoading}
            />
            <button className="chatbot-send" type="submit" aria-label="Send message" title="Send message" disabled={isLoading || !draft.trim()}>
              <FiSend />
            </button>
          </form>
        </section>
      )}

      <button
        className="chatbot-launcher"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        title={isOpen ? 'Close assistant' : 'Open assistant'}
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </button>
    </div>
  )
}

export default Chatbot