'use client'

import { useState, useCallback, useEffect } from 'react'
import AutoGrowingTextarea from '@/components/AutoGrowingTextarea'
import { useWebChat } from '@/lib/api/webchat'
import WebChatSourceList from './components/WebChatSourceList'
import ReactMarkdown from 'react-markdown'
import { filterDocumentsByCitations } from '@/lib/utils/citations'

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

// Load chat history from sessionStorage
const loadChatHistory = () => {
  try {
    if (typeof window === 'undefined') return []
    const savedHistory = sessionStorage.getItem(CHAT_HISTORY_KEY)
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      if (Array.isArray(parsed)) return parsed
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

  useEffect(() => {
    saveChatHistory(chatHistory)
  }, [chatHistory])

  useEffect(() => {
    return () => saveChatHistory(chatHistory)
  }, [chatHistory])

  const handleQuestionSubmit = useCallback(async (questionText) => {
    if (!questionText.trim()) return

    setCurrentQuestion(questionText)
    setLoading(true)

    try {
      const data = await askQuestion(questionText)
      const answer = data.answer || ''
      const allDocuments = data.documents || []

      const documents = filterDocumentsByCitations(allDocuments, answer)

      const formattedSources = documents.map((doc, index) => {
        const url = doc.meta?.source_url || doc.meta?.url || ''
        const fileName = doc.meta?.file_name || ''
        const filePath = doc.meta?.file_path || ''
        const sourceTitle = doc.meta?.source_title || ''
        const sourceType = doc.meta?.type || ''
        let title = sourceTitle || fileName
        if (!title && url) title = getDomainName(url)
        else if (!title) title = 'Unknown Source'
        const domainName = url ? getDomainName(url) : title
        const isHtml = sourceType === 'html' || (fileName && fileName.toLowerCase().endsWith('.html'))
        return {
          id: index,
          url,
          title,
          content: doc.content || '',
          domainName,
          filePath,
          isHtml,
        }
      })

      setChatHistory((prev) => [
        ...prev,
        {
          question: questionText,
          answer,
          sources: formattedSources,
          timestamp: new Date().toISOString(),
        },
      ])
      setCurrentQuestion('')
    } catch (err) {
      console.error('Failed to fetch answer:', err)
      setChatHistory((prev) => [
        ...prev,
        {
          question: questionText,
          answer: 'Er is een fout opgetreden bij het ophalen van het antwoord.',
          sources: [],
          timestamp: new Date().toISOString(),
        },
      ])
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
              <div className="w-full font-montserrat font-normal text-[16px] leading-normal prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} className="text-[#23BD92] hover:text-[#1ea87c] underline font-medium" target="_blank" rel="noopener noreferrer" />
                    ),
                    p: ({ node, ...props }) => <p {...props} className="mb-2" />,
                  }}
                >
                  {message.answer}
                </ReactMarkdown>
              </div>
            )}

            {/* Sources Section - Document Chat style */}
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

        {/* Input at the bottom */}
        <AutoGrowingTextarea onSubmit={handleQuestionSubmit} loading={loading} />
      </section>
    </div>
  )
}
