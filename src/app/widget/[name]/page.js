"use client"
import React, { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import "./page.css"

export default function WidgetPage() {
  const { name } = useParams()
  const ChatBotName = name ? decodeURIComponent(name) : ""

  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [sessionId, setSessionId] = useState("")

  // 1. Generate or read persistent guest Session ID
  useEffect(() => {
    if (!ChatBotName) return
    const key = `widget_session_id:${ChatBotName}`
    let id = localStorage.getItem(key)
    if (!id) {
      id = (crypto && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36)
      localStorage.setItem(key, id)
    }
    setSessionId(id)
  }, [ChatBotName])

  // 2. Fetch conversation history when session ID is ready
  useEffect(() => {
    if (!ChatBotName || !sessionId) return

    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/widget/messages?chatbotName=${encodeURIComponent(ChatBotName)}&sessionId=${encodeURIComponent(sessionId)}`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length) {
            const mapped = data.map((m) => ({
              role: m.role === "user" ? "You" : "Bot",
              text: m.text
            }))
            setChatHistory(mapped)
          }
        }
      } catch (err) {
        console.error("Failed to load chat widget history:", err)
      }
    }

    loadHistory()
  }, [ChatBotName, sessionId])

  // 3. Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  // 4. Send message handler
  const handleSend = async () => {
    if (!message.trim() || isButtonDisabled || !sessionId || !ChatBotName) return

    setIsButtonDisabled(true)
    setIsTyping(true)

    const userMessage = message.trim()
    
    // Add user message to UI immediately
    setChatHistory(prev => [...prev, { role: "You", text: userMessage }])
    setMessage("")

    let botMessage = "";
    let addedPlaceholder = false;

    try {
      const response = await fetch("/api/widget/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chatbotName: ChatBotName,
          text: userMessage,
          sessionId: sessionId
        })
      })

      if (!response.ok) {
        throw new Error("Chat request failed")
      }

      setIsTyping(false)

      // Add empty placeholder for streaming response
      setChatHistory(prev => {
        addedPlaceholder = true;
        return [...prev, { role: "Bot", text: "" }];
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        botMessage += chunk;

        setChatHistory(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = { role: "Bot", text: botMessage };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Error in widget messaging:", error)
      const errorMessage = "Sorry, I encountered an error. Please try again."
      
      if (addedPlaceholder) {
        setChatHistory(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = { role: "Bot", text: botMessage + " \n\n[Error: " + errorMessage + "]" };
          }
          return updated;
        });
      } else {
        setChatHistory(prev => [...prev, { role: "Bot", text: errorMessage }])
      }
    } finally {
      setIsTyping(false)
      setTimeout(() => {
        setIsButtonDisabled(false)
      }, 500)
    }

    inputRef.current?.focus()
  }

  return (
    <div className="widget-wrapper">
      <div className="widget-header">
        <h1>{ChatBotName}</h1>
        <p>Ask me anything!</p>
      </div>

      <div className="widget-chat-window">
        <div className="widget-messages">
          {chatHistory.length === 0 && (
            <div className="widget-message widget-bot-message">
              <div className="widget-message-content">
                <p>Hello! How can I help you today? 👋</p>
              </div>
            </div>
          )}

          {chatHistory.map((msg, idx) => (
            <div 
              key={idx} 
              className={`widget-message ${msg.role === "You" ? "widget-user-message" : "widget-bot-message"}`}
            >
              <div className="widget-message-content">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="widget-message widget-bot-message">
              <div className="widget-message-content">
                <div className="widget-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="widget-input-area">
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
        
        <div className="widget-footer">
          Powered by <a href="#" target="_blank" rel="noreferrer">NexCraft</a>
        </div>
      </div>
    </div>
  )
}
