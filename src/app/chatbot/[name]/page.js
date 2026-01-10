"use client"
import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { getChatbotByName } from "@/services/chatbot"
import { getToken } from "@/helpers/auth"
import { askGemini } from "@/services/ai"
import { fetchMessages, addMessageApi } from "@/services/messages"
import "./page.css"

export default function Page() {
  const { name: ChatBotName } = useParams()
  const inputRef = useRef(null)
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [botDetails, setBotDetails] = useState({ name: "", context: "" })
  const [isTyping, setIsTyping] = useState(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const messagesEndRef = useRef(null)
  const storageKeyRef = useRef("")

  useEffect(() => {
    if (!ChatBotName) return
    const token = getToken()
    getChatbotByName({ token, name: ChatBotName })
      .then((data) => {
        if (data?.name) {
          setBotDetails({ name: data.name, context: data.context || "" })
          storageKeyRef.current = `chat_history:${data.name}`
          try {
            const saved = localStorage.getItem(storageKeyRef.current)
            if (saved) {
              const parsed = JSON.parse(saved)
              if (Array.isArray(parsed)) {
                setChatHistory(parsed)
              }
            }
          } catch {}
          // Fetch server history for this user + chatbot
          if (token) {
            fetchMessages({ token, chatbotName: data.name })
              .then((serverMsgs) => {
                if (Array.isArray(serverMsgs) && serverMsgs.length) {
                  const mapped = serverMsgs.map((m) => ({ role: m.role === "user" ? "You" : "Bot", text: m.text }))
                  setChatHistory(mapped)
                }
              })
              .catch(() => {})
          }
        } else {
          console.warn("Chatbot data is invalid or missing name");
          setBotDetails({ name: ChatBotName, context: "" })
        }
      })
      .catch((err) => {
        console.error("Failed to load chatbot:", err);
        // Set fallback data so user can still use the chat
        setBotDetails({ name: ChatBotName, context: "" })
      })
  }, [ChatBotName])

  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  // Persist chat history whenever it changes
  useEffect(() => {
    if (!storageKeyRef.current) return
    try {
      localStorage.setItem(storageKeyRef.current, JSON.stringify(chatHistory))
    } catch {}
  }, [chatHistory])

  const handleSend = async() => {
    if (!message.trim() || isButtonDisabled) return
    
    setIsButtonDisabled(true)
    setIsTyping(true)
    
    const userMessage = message
    setChatHistory(prev => [...prev, { role: "You", text: userMessage }])
    setMessage("")
    
    try {
      // Save user message to server
      const token = getToken()
      if (token && botDetails.name) {
        addMessageApi({ token, chatbotName: botDetails.name, role: "user", text: userMessage }).catch(() => {})
      }
      const response = await askGemini({
        text: userMessage,
        context: botDetails.context,
      })
      const data = await response.json()
      const botMessage = data?.response?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      setChatHistory(prev => [...prev, { role: "Bot", text: botMessage || "Sorry, I couldn't generate a response." }])
      // Save bot message to server
      if (token && botDetails.name) {
        addMessageApi({ token, chatbotName: botDetails.name, role: "bot", text: botMessage }).catch(() => {})
      }
    } catch (error) {
      console.error("Error getting response:", error)
      setChatHistory(prev => [...prev, { role: "Bot", text: "Sorry, I encountered an error. Please try again." }])
    } finally {
      setIsTyping(false)
      setTimeout(() => {
        setIsButtonDisabled(false)
      }, 500)
    }
    
    inputRef.current?.focus()
  }

  return (
    <div className="chatbotV2_wrapper">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h1>{botDetails.name}</h1>
          <p>Chat with your AI assistant</p>
        </div>

        <div className="chatbot-chat-window">
          <div className="chatbot-messages">
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`chatbot-message ${msg.role === "You" ? "chatbot-user-message" : "chatbot-bot-message"}`}
              >
                <div className="chatbot-message-content">
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chatbot-message chatbot-bot-message">
                <div className="chatbot-message-content">
                  <div className="chatbot-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isTyping}
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !message.trim() || isButtonDisabled}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}