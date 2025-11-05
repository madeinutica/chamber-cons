'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Business } from '@/types/business'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface ChatBotProps {
  businesses?: Business[]
  onShowOnMap?: (business: Business, action?: string) => void
}

export default function ChatBot({ businesses: propBusinesses = [], onShowOnMap }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [businesses, setBusinesses] = useState<Business[]>(propBusinesses)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your CNY Business Concierge. I can help you find local businesses, get directions, check hours, and answer questions about our business directory. Use the quick actions below or ask me anything!',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Update businesses when props change
  useEffect(() => {
    if (propBusinesses.length > 0) {
      setBusinesses(propBusinesses)
    }
  }, [propBusinesses])

  // Fetch businesses when component mounts (fallback if not provided via props)
  useEffect(() => {
    if (businesses.length === 0) {
      const fetchBusinesses = async () => {
        try {
          console.log('Fetching businesses...')
          const response = await fetch('/api/businesses')
          console.log('Businesses API response status:', response.status)
          if (response.ok) {
            const data = await response.json()
            console.log('Fetched businesses data:', data)
            console.log('Fetched businesses:', data.businesses ? data.businesses.length : 'undefined', 'businesses')
            setBusinesses(data.businesses || [])
          } else {
            console.error('Failed to fetch businesses:', response.status)
          }
        } catch (error) {
          console.error('Failed to fetch businesses:', error)
        }
      }
      
      fetchBusinesses()
    }
  }, [businesses.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Quick action buttons data
  const quickActions = [
    { id: 'restaurants', text: '🍽️ Find Restaurants', query: 'Show me the best restaurants in the area' },
    { id: 'coffee', text: '☕ Coffee Shops', query: 'Where can I get good coffee?' },
    { id: 'veteran', text: '🇺🇸 Veteran-Owned', query: 'Show me veteran-owned businesses' },
    { id: 'featured', text: '⭐ Featured Businesses', query: 'What are the featured businesses?' },
    { id: 'shopping', text: '🛍️ Shopping', query: 'Where can I go shopping?' },
    { id: 'services', text: '🔧 Services', query: 'What services are available?' }
  ]

  const handleQuickAction = async (query: string) => {
    setShowQuickActions(false)
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      console.log('Sending quick action with businesses:', businesses.length, 'businesses')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          businesses: businesses,
          hasMapAccess: !!onShowOnMap
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Check if the response includes a business to show on the map
      if (data.showOnMap && onShowOnMap) {
        const businessToShow = businesses.find(b => 
          b.name.toLowerCase().includes(data.showOnMap.toLowerCase()) ||
          b.id === data.showOnMap
        )
        if (businessToShow) {
          onShowOnMap(businessToShow, 'show')
        }
      }
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Chat error:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again or browse our business directory!",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    setShowQuickActions(false) // Hide quick actions after first user message

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputText
    setInputText('')
    setIsTyping(true)

    try {
      console.log('Sending message with businesses:', businesses.length, 'businesses')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          businesses: businesses, // Pass actual business data
          hasMapAccess: !!onShowOnMap // Tell AI it can show things on map
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Check if the response includes a business to show on the map
      if (data.showOnMap && onShowOnMap) {
        const businessToShow = businesses.find(b => 
          b.name.toLowerCase().includes(data.showOnMap.toLowerCase()) ||
          b.id === data.showOnMap
        )
        if (businessToShow) {
          onShowOnMap(businessToShow, 'show')
        }
      }
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Chat error:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again or browse our business directory!",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-xl">💬</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold">CNY Business Concierge</h3>
          <p className="text-xs text-primary-100">Ask me anything!</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 ${message.isUser ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-xs ${
                message.isUser
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        ))}
        
        {/* Quick Action Buttons */}
        {showQuickActions && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-2 text-center">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.query)}
                  className="bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-lg p-2 text-xs transition-colors duration-200 text-left"
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Show Quick Actions Button */}
        {!showQuickActions && messages.length > 1 && (
          <div className="mb-3 text-center">
            <button
              onClick={() => setShowQuickActions(true)}
              className="text-xs text-primary-600 hover:text-primary-800 underline"
            >
              Show Quick Actions
            </button>
          </div>
        )}
        
        {isTyping && (
          <div className="text-left mb-3">
            <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your CNY Business Concierge anything..."
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-sm">📤</span>
          </button>
        </div>
      </div>
    </div>
  )
}