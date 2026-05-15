'use client'
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import AutoGrowingTextarea from '@/components/AutoGrowingTextarea'
import PdfSnippetList from '@/components/PdfSnippetList'
import ReactMarkdown from 'react-markdown'
import { filterDocumentsByCitations } from '@/lib/utils/citations'
import { rememberPublicChatPath } from '@/lib/publicChatResume'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://demo.daviapp.nl/api"
const CHAT_HISTORY_KEY = 'publicchat_history'

export default function PublicChatPage({ params }) {
  const routerParams = useParams()
  const companyAdmin = routerParams?.company_admin || params?.company_admin
  const chatName = routerParams?.chatName || params?.chatName
  
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [loadingCardVisible, setLoadingCardVisible] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [chatInfo, setChatInfo] = useState(null)
  const [passwordVerified, setPasswordVerified] = useState(false)
  const messagesEndRef = useRef(null)

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    try {
      const savedHistory = sessionStorage.getItem(`${CHAT_HISTORY_KEY}_${companyAdmin}_${chatName}`)
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory)
        if (Array.isArray(parsed)) {
          setChatHistory(parsed)
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
    }
  }, [companyAdmin, chatName])

  // Save chat history to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(`${CHAT_HISTORY_KEY}_${companyAdmin}_${chatName}`, JSON.stringify(chatHistory))
    } catch (err) {
      console.error('Failed to save chat history:', err)
    }
  }, [chatHistory, companyAdmin, chatName])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, currentQuestion, loadingCardVisible])

  useEffect(() => {
    loadChatInfo()
  }, [companyAdmin, chatName])

  /** Remember concrete URL so PWA launcher (/publicChat) can resume after cold start */
  useEffect(() => {
    if (typeof window === 'undefined' || companyAdmin == null || chatName == null) return
    rememberPublicChatPath(window.location.pathname)
  }, [companyAdmin, chatName])

  useEffect(() => {
    if (typeof window === 'undefined' || companyAdmin == null || chatName == null) return
    const persist = () => rememberPublicChatPath(window.location.pathname)
    const onVis = () => {
      if (document.visibilityState === 'visible') persist()
    }
    const onInstalled = () => persist()
    window.addEventListener('pageshow', persist)
    window.addEventListener('appinstalled', onInstalled)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('pageshow', persist)
      window.removeEventListener('appinstalled', onInstalled)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [companyAdmin, chatName])

  const loadChatInfo = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/public-chat/${companyAdmin}/${chatName}`
      )
      if (response.ok) {
        const data = await response.json()
        setChatInfo(data.chat)
        const requiresPassword = data.chat.requires_password
        setPasswordRequired(requiresPassword)
        if (!requiresPassword) {
          setPasswordVerified(true)
        }
      } else if (response.status === 404) {
        setPasswordError("Chat niet gevonden")
      }
    } catch (err) {
      console.error("Failed to load chat info:", err)
      setPasswordError("Kon chat informatie niet laden")
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError("")
    
    if (!password.trim()) {
      setPasswordError("Voer een wachtwoord in")
      return
    }

    try {
      // Verify password using dedicated verification endpoint (doesn't query RAG)
      const response = await fetch(
        `${API_BASE_URL}/public-chat/${companyAdmin}/${chatName}/verify-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: password.trim(),
          }),
        }
      )

      if (response.ok) {
        // Password is correct - allow access
        setPasswordVerified(true)
        setPasswordRequired(false)
        setPasswordError("")
      } else if (response.status === 401) {
        setPasswordError("Ongeldig wachtwoord. Probeer opnieuw.")
        setPassword("") // Clear password on error
      } else if (response.status === 403) {
        setPasswordError("Wachtwoord vereist voor deze chat.")
      } else {
        setPasswordError("Kon wachtwoord niet verifiëren. Probeer opnieuw.")
      }
    } catch (err) {
      setPasswordError("Fout bij verificatie. Controleer uw verbinding.")
      console.error("Password verification error:", err)
    }
  }

  const handleQuestionSubmit = async (questionText) => {
    if (!questionText.trim()) return

    // Block all questions if password is required but not verified
    if (passwordRequired && !passwordVerified) {
      setPasswordError("Voer eerst het wachtwoord in")
      return
    }

    setCurrentQuestion(questionText)
    setLoadingCardVisible(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/public-chat/${companyAdmin}/${chatName}/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: questionText,
            // Password is not needed for queries - it's only required for initial access
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to get response" }))
        throw new Error(error.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const answer = data.answer || ''
      const allDocuments = data.documents || (data.sources || []).map((source, index) => {
        return {
          content: source.file_name || source.url || `Bron ${index + 1}`,
          meta: {
            file_path: source.url || source.file_name || '',
            file_name: source.file_name || source.url || '',
            page_number: index + 1,
            type: source.type,
            url: source.url,
            source_url: source.url,
            source_title: source.title || source.file_name || source.url
          }
        }
      })
      
      // Filter documents to only include cited ones
      const documents = filterDocumentsByCitations(allDocuments, answer)
      
      const newMessage = {
        question: questionText,
        answer: answer,
        documents: documents,
        timestamp: new Date().toISOString()
      }
      
      setChatHistory(prev => [...prev, newMessage])
      setCurrentQuestion('')
    } catch (err) {
      console.error('Failed to fetch answer:', err)
      const errorMessage = 'Er is een fout opgetreden bij het ophalen van het antwoord.'
      
      const errorMessageObj = {
        question: questionText,
        answer: errorMessage,
        documents: [],
        timestamp: new Date().toISOString()
      }
      
      setChatHistory(prev => [...prev, errorMessageObj])
      setCurrentQuestion('')
    } finally {
      setLoadingCardVisible(false)
    }
  }

  // Block access if password is required but not verified
  const isBlocked = passwordRequired && !passwordVerified

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#FAFFFE] via-white to-[#F0FDF4] relative">
      {/* Password Modal Overlay - Blocks all access */}
      {isBlocked && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full border border-gray-100 transform transition-all duration-300 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#23BD92] to-[#1ea87c] mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2 font-montserrat text-gray-800">Beveiligde Chat</h1>
              <p className="text-gray-600 font-montserrat">Voer het wachtwoord in om toegang te krijgen</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 font-montserrat">
                  Wachtwoord
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError("")
                  }}
                  className="w-full h-14 rounded-xl border-2 border-gray-200 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent font-montserrat text-[16px] transition-all duration-200 hover:border-gray-300"
                  placeholder="Voer wachtwoord in"
                  autoFocus
                />
                {passwordError && (
                  <div className="mt-3 flex items-center gap-2 text-red-500 text-sm font-montserrat animate-fade-in">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordError}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#23BD92] to-[#1ea87c] hover:from-[#1ea87c] hover:to-[#23BD92] text-white font-bold text-base rounded-xl h-14 transition-all duration-300 font-montserrat shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Toegang Verkrijgen
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Blur and disable content when password is required */}
      <div className={isBlocked ? "pointer-events-none opacity-30 blur-sm" : ""}>
      {/* Elegant Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#23BD92] to-[#1ea87c] flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-none tracking-normal font-montserrat text-[#23BD92]">DAVI</h1>
                <p className="text-sm text-gray-500 font-montserrat mt-1">Publieke chat - {chatName || "Public Chat"}</p>
              </div>
            </div>
            {chatHistory.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 text-[#23BD92]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-600 font-montserrat">{chatHistory.length} {chatHistory.length === 1 ? 'vraag' : 'vragen'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-col gap-[60px] lg:py-[80px] lg:px-[120px] px-[32px] py-[40px] max-w-7xl mx-auto">
        <section className="flex flex-col gap-[60px]">
          {/* Empty State */}
          {chatHistory.length === 0 && !currentQuestion && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#23BD92] to-[#1ea87c] flex items-center justify-center shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold font-montserrat text-gray-800 mb-3">Welkom bij {chatName || "Public Chat"}</h2>
              <p className="text-lg text-gray-600 font-montserrat text-center max-w-md">
                Stel hieronder een vraag om te beginnen. Ik help je graag verder!
              </p>
            </div>
          )}

          {/* Display all chat history */}
          {chatHistory.map((message, index) => (
            <div key={index} className="flex flex-col gap-6 animate-slide-up">
              {/* Enhanced Question Card - Right Aligned */}
              <div className="flex justify-end">
                <div className="w-fit max-w-3xl bg-gradient-to-r from-[#23BD92] to-[#1ea87c] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-4 transform hover:-translate-y-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-white text-[17px] leading-7 font-medium font-montserrat">
                        {message.question}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Answer Card - Left Aligned */}
              {message.answer && (
                <div className="flex justify-start">
                  <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#23BD92] to-[#1ea87c] shadow-md flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="w-full font-montserrat font-normal text-[17px] leading-relaxed text-gray-800 prose prose-sm max-w-none">
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
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Sources Section - Left Aligned */}
              {Array.isArray(message.documents) && message.documents.length > 0 && (
                <div className="flex justify-start">
                  <section className="w-full max-w-3xl">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform transition-all duration-300 hover:shadow-xl">
                      <PdfSnippetList 
                        documents={message.documents} 
                        publicChatContext={{
                          companyAdmin: companyAdmin,
                          chatName: chatName
                        }}
                      />
                    </div>
                  </section>
                </div>
              )}
            </div>
          ))}

          {/* Enhanced Loading Question Card - Right Aligned */}
          {currentQuestion && (
            <div className="flex justify-end animate-slide-up">
              <div className="w-fit max-w-3xl bg-gradient-to-r from-[#23BD92] to-[#1ea87c] rounded-2xl shadow-lg px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-white text-[17px] leading-7 font-medium font-montserrat">
                      {currentQuestion}
                    </p>
                  </div>
                  {loadingCardVisible && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading Answer Indicator - Left Aligned */}
          {loadingCardVisible && currentQuestion && (
            <div className="flex justify-start animate-slide-up">
              <div className="w-fit max-w-3xl bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#23BD92] to-[#1ea87c] shadow-sm flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-montserrat font-medium">Denken...</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#23BD92] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#23BD92] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#23BD92] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </section>

        {/* Enhanced Input Section - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-2xl -mx-6 lg:-mx-12 px-6 lg:px-12 py-6 mt-auto">
          <div className="max-w-4xl mx-auto">
            <AutoGrowingTextarea 
              onSubmit={handleQuestionSubmit} 
              loading={loading || loadingCardVisible}
              disabled={isBlocked}
            />
          </div>
        </div>
      </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
