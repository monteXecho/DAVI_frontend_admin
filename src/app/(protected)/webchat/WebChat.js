'use client'

import { useState, useCallback, useEffect } from 'react'
import AutoGrowingTextarea from '@/components/AutoGrowingTextarea'
import { useWebChat } from '@/lib/api/webchat'
import WebChatSourceList from './components/WebChatSourceList'

const CHAT_HISTORY_KEY = 'webchat_history'

// Helper function to extract domain name from URL
const getDomainName = (url) => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

// Helper function to make URLs in text clickable with website names
const renderTextWithLinks = (text) => {
  if (!text) return text
  
  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g
  const parts = []
  let lastIndex = 0
  let match
  
  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) })
    }
    
    // Process the URL
    let url = match[0]
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`
    }
    
    const domainName = getDomainName(url)
    
    parts.push({ type: 'link', url, domainName })
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) })
  }
  
  if (parts.length === 0) {
    return text
  }
  
  return parts.map((part, index) => {
    if (part.type === 'link') {
      return (
        <a
          key={index}
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#23BD92] hover:text-[#1ea87c] underline font-medium"
        >
          {part.domainName}
        </a>
      )
    }
    return <span key={index}>{part.content}</span>
  })
}

// Load chat history from sessionStorage
const loadChatHistory = () => {
  try {
    if (typeof window === 'undefined') return []
    const savedHistory = sessionStorage.getItem(CHAT_HISTORY_KEY)
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed to load chat history:', err)
  }
  return []
}

// Save chat history to sessionStorage
const saveChatHistory = (history) => {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history))
    }
  } catch (err) {
    console.error('Failed to save chat history:', err)
  }
}

export default function WebChat() {
  const { askQuestion } = useWebChat()
  const [chatHistory, setChatHistory] = useState(() => loadChatHistory())
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')

  // Save chat history to sessionStorage whenever it changes
  useEffect(() => {
    saveChatHistory(chatHistory)
  }, [chatHistory])

  // Save on unmount as well
  useEffect(() => {
    return () => {
      saveChatHistory(chatHistory)
    }
  }, [chatHistory])

  const handleQuestionSubmit = useCallback(async (questionText) => {
    if (!questionText.trim()) return

    setCurrentQuestion(questionText)
    setLoading(true)

    try {
      const data = await askQuestion(questionText)
      const answer = data.answer || ''
      
      // Format sources from documents - extract URL and title from meta
      const formattedSources = (data.documents || []).map((doc, index) => {
        const url = doc.meta?.url || ''
        const fileName = doc.meta?.file_name || ''
        
        // Use file_name as title, or domain name if file_name is not available
        let title = fileName
        if (!title && url) {
          title = getDomainName(url)
        } else if (!title) {
          title = 'Unknown Source'
        }
        
        const domainName = url ? getDomainName(url) : title
        
        return {
          id: index,
          url: url,
          title: title,
          content: doc.content || '',
          domainName: domainName
        }
      })
      
      // Add new message to history
      const newMessage = {
        question: questionText,
        answer: answer,
        sources: formattedSources,
        timestamp: new Date().toISOString()
      }
      
      setChatHistory(prev => [...prev, newMessage])
      setCurrentQuestion('')
    } catch (err) {
      console.error('Failed to fetch answer:', err)
      const errorMessage = 'Er is een fout opgetreden bij het ophalen van het antwoord.'
      
      // Add error message to history
      const errorMessageObj = {
        question: questionText,
        answer: errorMessage,
        sources: [],
        timestamp: new Date().toISOString()
      }
      
      setChatHistory(prev => [...prev, errorMessageObj])
      setCurrentQuestion('')
    } finally {
      setLoading(false)
    }
  }, [askQuestion])

  return (
    <div className="w-full h-full flex flex-col gap-[50px] lg:py-[143px] lg:px-[97px] px-[25px] py-[22px] overflow-scroll scrollbar-hide">
      <section className="flex flex-col gap-[52px]">
        <div className="mb-4">
          <h1 className="text-4xl font-bold font-montserrat mb-2">WebChat</h1>
          <p className="text-gray-600 font-montserrat">
            Je kunt direct een vraag stellen, waarbij de antwoorden zijn gebaseerd op gecureerde websites van jouw organisatie.
          </p>
        </div>

        {/* Display all chat history */}
        {chatHistory.map((message, index) => (
          <div key={index} className="flex flex-col gap-[52px]">
            {/* Question */}
            <div className="w-fit h-[61px] bg-[#F9FBFA] rounded-lg flex justify-between items-start px-4 gap-11">
              <p className="w-fit h-6 m-auto text-[#342222] text-[16px] leading-6 font-normal font-Montserrat">
                {message.question}
              </p>
            </div>

            {/* Answer with clickable URLs */}
            {message.answer && (
              <div className="w-full font-montserrat font-normal text-[16px] whitespace-pre-wrap leading-normal">
                {renderTextWithLinks(message.answer)}
              </div>
            )}

            {/* Sources Section - Similar to PdfSnippetList */}
            {Array.isArray(message.sources) && message.sources.length > 0 && (
              <section className="w-full">
                <WebChatSourceList sources={message.sources} />
              </section>
            )}
          </div>
        ))}

        {/* Current question being processed */}
        {currentQuestion && (
          <div className="w-fit h-[61px] bg-[#F9FBFA] rounded-lg flex justify-between items-start px-4 gap-11">
            <p className="w-fit h-6 m-auto text-[#342222] text-[16px] leading-6 font-normal font-Montserrat">
              {currentQuestion}
            </p>
            {loading && (
              <div className="w-[29px] h-[29px] m-auto border-4 border-t-[#23BD92] border-[#F9FBFA] rounded-full animate-spin" />
            )}
          </div>
        )}

        {/* Always show the input at the bottom */}
        <AutoGrowingTextarea onSubmit={handleQuestionSubmit} loading={loading} />
      </section>
    </div>
  )
}

