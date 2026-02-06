'use client'

import { useState, useCallback } from 'react'
import AutoGrowingTextarea from '@/components/AutoGrowingTextarea'
import { useWebChat } from '@/lib/api/webchat'

export default function WebChat() {
  const { askQuestion } = useWebChat()
  const [response, setResponse] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [submittedQuestion, setSubmittedQuestion] = useState('')

  const handleQuestionSubmit = useCallback(async (questionText) => {
    if (!questionText.trim()) return

    setResponse('')
    setSources([])
    setSubmittedQuestion(questionText)
    setLoading(true)

    try {
      const data = await askQuestion(questionText)
      setResponse(data.answer || '')
      
      // Format sources from documents
      const formattedSources = (data.documents || []).map((doc, index) => ({
        id: index,
        url: doc.meta?.url || '',
        title: doc.meta?.file_name || `Bron ${index + 1}`,
        date: new Date().toLocaleDateString('nl-NL', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
      setSources(formattedSources)
    } catch (err) {
      console.error('Failed to fetch answer:', err)
      setResponse('Er is een fout opgetreden bij het ophalen van het antwoord.')
    } finally {
      setLoading(false)
    }
  }, [askQuestion])

  return (
    <div className="flex flex-col h-full w-full p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-montserrat mb-2">WebChat</h1>
        <p className="text-gray-600 font-montserrat">
          Je kunt direct een vraag stellen, waarbij de antwoorden zijn gebaseerd op gecureerde websites van jouw organisatie.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {submittedQuestion && (
            <div className="w-fit h-[61px] bg-[#F9FBFA] rounded-lg flex justify-between items-start px-4 gap-11">
              <p className="w-fit h-6 m-auto text-[#342222] text-[16px] leading-6 font-normal font-Montserrat">
                {submittedQuestion}
              </p>
              {loading && (
                <div className="w-[29px] h-[29px] m-auto border-4 border-t-[#23BD92] border-[#F9FBFA] rounded-full animate-spin" />
              )}
            </div>
          )}

          {response && !loading && (
            <div className="w-full font-montserrat font-normal text-[16px] whitespace-pre-wrap leading-normal">
              {response}
            </div>
          )}

          {/* Sources Section */}
          {sources.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Bronnen: Gecureerde websites van jouw organisatie
                </h3>
                <a
                  href="/bronnen"
                  className="text-sm text-[#23BD92] hover:text-[#1ea87c] font-medium"
                >
                  Beheer bronnen
                </a>
              </div>
              <div className="space-y-3">
                {sources.map((source) => (
                  <div key={source.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {source.url || source.title}
                        </span>
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                      {source.title && source.url && (
                        <p className="text-sm text-gray-600 mt-1">{source.title}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-500">{source.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Field */}
        {!loading && submittedQuestion && (
          <AutoGrowingTextarea onSubmit={handleQuestionSubmit} loading={loading} />
        )}

        {!submittedQuestion && !loading && (
          <AutoGrowingTextarea onSubmit={handleQuestionSubmit} loading={loading} />
        )}
      </div>
    </div>
  )
}

