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

// Component to format and render bot messages with rich text
const FormattedMessage = ({ text, businesses, onShowOnMap }: { 
  text: string, 
  businesses: Business[], 
  onShowOnMap?: (business: Business, action?: string) => void 
}) => {
  // Split text by double newlines to create paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim())
  
  const formatText = (text: string) => {
    // Handle markdown-style formatting
    return text
      // Bold text **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Business names with phone/address formatting
      .replace(/Phone: ([\d\s\-\(\)]+)/g, '<span class="text-blue-600 font-medium">📞 $1</span>')
      .replace(/Address: ([^|]+)/g, '<span class="text-green-600 font-medium">📍 $1</span>')
      // Rating formatting
      .replace(/(\d+\.?\d*)\/5 star/g, '<span class="text-yellow-600 font-medium">⭐ $1/5</span>')
      // Website formatting
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-500 underline hover:text-blue-700">🔗 Website</a>')
  }

  const extractBusinessInfo = (text: string) => {
    // Look for business name patterns in the text
    const businessMatches = businesses.filter(business => 
      text.toLowerCase().includes(business.name.toLowerCase())
    )
    return businessMatches.slice(0, 3) // Limit to 3 business cards
  }

  const businessCards = extractBusinessInfo(text)

  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, index) => (
        <div key={index}>
          <p 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatText(paragraph) }}
          />
          
          {/* Show business cards after relevant paragraphs */}
          {index === 0 && businessCards.length > 0 && (
            <div className="mt-3 space-y-2">
              {businessCards.map((business) => (
                <div 
                  key={business.id}
                  className="bg-gradient-to-br from-white to-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                  onClick={() => onShowOnMap?.(business, 'show')}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{business.name}</h4>
                    <div className="flex items-center text-xs">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 font-medium">{business.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{business.category}</p>
                  
                  <div className="space-y-1 text-xs">
                    {business.phone && (
                      <div className="flex items-center text-blue-600">
                        <span className="mr-1">📞</span>
                        <span>{business.phone}</span>
                      </div>
                    )}
                    {business.address && (
                      <div className="flex items-center text-green-600">
                        <span className="mr-1">📍</span>
                        <span className="truncate">{business.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {business.featured && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">✨ Featured</span>
                    )}
                    {business.veteranOwned && (
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">🇺🇸 Veteran</span>
                    )}
                    {business.isNonprofit && (
                      <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">💚 Non-Profit</span>
                    )}
                  </div>
                  
                  <div className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                    <span>Click to view on map</span>
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ChatBot({ businesses: propBusinesses = [], onShowOnMap }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
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
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 border border-white/20 backdrop-blur-sm"
        >
          <div className="relative">
            <span className="text-2xl">💬</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-gradient-to-br from-white via-gray-50 to-indigo-50 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl z-50 flex flex-col transition-all duration-300 ${
      isExpanded 
        ? 'w-96 h-[600px]' 
        : 'w-80 h-96'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white p-4 rounded-t-2xl shadow-lg flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="relative">
              <span className="text-xl">🏛️</span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="font-bold text-lg tracking-wide">Biz Concierge</h3>
          </div>
          <p className="text-indigo-100 text-xs font-medium">AI Assistant</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            title={isExpanded ? "Make smaller" : "Expand chat"}
          >
            {isExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13l3 3 7-7" />
              </svg>
            )}
          </button>
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            title="Close chat"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 ${message.isUser ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-3 rounded-xl ${
                message.isUser
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none max-w-xs shadow-lg'
                  : 'bg-gradient-to-br from-gray-50 to-white text-gray-800 rounded-bl-none max-w-sm border border-gray-200 shadow-sm'
              }`}
            >
              {message.isUser ? (
                <p className="text-sm">{message.text}</p>
              ) : (
                <FormattedMessage 
                  text={message.text} 
                  businesses={businesses}
                  onShowOnMap={onShowOnMap}
                />
              )}
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
                  className="bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 border border-indigo-200 rounded-xl p-3 text-xs transition-all duration-200 text-left shadow-sm hover:shadow-md transform hover:scale-105"
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
              className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
            >
              Show Quick Actions
            </button>
          </div>
        )}
        
        {isTyping && (
          <div className="text-left mb-3">
            <div className="inline-block p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white text-gray-800 rounded-bl-none border border-gray-200 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gradient bg-gradient-to-r from-gray-50 to-indigo-50 rounded-b-2xl">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your CNY Business Concierge anything..."
            className="flex-1 p-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-3 rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="text-sm">📤</span>
          </button>
        </div>
      </div>
    </div>
  )
}