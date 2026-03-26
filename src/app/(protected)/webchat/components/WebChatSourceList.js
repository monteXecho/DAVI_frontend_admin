'use client'

import { useState } from 'react'
import { useKeycloak } from '@react-keycloak/web'

// Helper function to extract domain name from URL
const getDomainName = (url) => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

// Group sources by URL (similar to PdfSnippetList grouping by file)
const groupSourcesByUrl = (sources = []) => {
  if (!Array.isArray(sources)) return {}
  
  const grouped = {}
  sources.forEach((source) => {
    // Use URL as key if available, otherwise use title
    const urlKey = source.url || source.title || 'Unknown'
    
    if (!grouped[urlKey]) {
      grouped[urlKey] = {
        url: source.url || '',
        filePath: source.filePath || '',
        isHtml: source.isHtml || false,
        title: source.title || (source.url ? getDomainName(source.url) : 'Unknown Source'),
        domainName: source.domainName || (source.url ? getDomainName(source.url) : source.title),
        snippets: []
      }
    }
    
    // Add snippet if content exists and is not duplicate
    if (source.content) {
      const snippetExists = grouped[urlKey].snippets.some(
        existing => existing.content === source.content
      )
      
      if (!snippetExists) {
        grouped[urlKey].snippets.push({
          content: source.content,
          title: source.title || grouped[urlKey].title
        })
      }
    }
  })
  
  return grouped
}

const WebChatSourceList = ({ sources }) => {
  const { keycloak } = useKeycloak()
  const [openUrl, setOpenUrl] = useState(null)
  const grouped = groupSourcesByUrl(sources)

  const handleOpenHtml = async (filePath) => {
    if (!filePath || !keycloak?.authenticated) return
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const encodedPath = encodeURIComponent(filePath)
      const url = `${baseUrl}/company-admin/sources/download?file_path=${encodedPath}`
      const headers = {
        Authorization: `Bearer ${keycloak.token}`,
        ...(typeof window !== 'undefined' && window.localStorage?.getItem('daviActingOwnerId')
          ? { 'X-Acting-Owner-Id': window.localStorage.getItem('daviActingOwnerId') }
          : {}),
        ...(typeof window !== 'undefined' && window.localStorage?.getItem('daviActingOwnerIsGuest') === 'true'
          ? { 'X-Acting-Owner-Is-Guest': 'true' }
          : {}),
      }
      const response = await fetch(url, { headers })
      if (response.ok) {
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        window.open(blobUrl, '_blank')
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100)
      }
    } catch (err) {
      console.error('Failed to open HTML file:', err)
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {Array.isArray(sources) && sources.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23BD92] to-[#1ea87c] flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-montserrat font-bold text-[18px] leading-6 tracking-normal text-gray-800">Bronnen</div>
            <div className="flex-1 h-px bg-gradient-to-r from-[#23BD92] to-transparent" />
            <span className="text-sm font-medium text-gray-500 font-montserrat">
              {sources.length} {sources.length === 1 ? 'bron' : 'bronnen'}
            </span>
          </div>
          <div className="space-y-3">
            {Object.entries(grouped).map(([urlKey, sourceData]) => (
              <div key={urlKey} className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-[#23BD92] transition-all duration-300 p-4 shadow-sm hover:shadow-md">
                <div className="w-full flex items-center justify-between">
                  <div
                    onClick={() => setOpenUrl(openUrl === urlKey ? null : urlKey)}
                    className="flex w-fit items-center gap-3 cursor-pointer group hover:gap-4 transition-all duration-200"
                  >
                    <div className="w-6 h-6 rounded-md bg-gray-100 group-hover:bg-[#23BD92] flex items-center justify-center transition-colors duration-200">
                      {openUrl === urlKey ? (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#23BD92] group-hover:text-white transition-colors">
                          <path d="M5 8L9.33013 0.5L0.669873 0.5L5 8Z" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 group-hover:text-white transition-colors">
                          <path d="M8 5L0.5 0.669872L0.5 9.33013L8 5Z" fill="currentColor" />
                        </svg>
                      )}
                    </div>
                    {sourceData.url ? (
                      <a
                        href={sourceData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-montserrat font-semibold text-[16px] leading-normal text-gray-800 group-hover:text-[#23BD92] transition-colors"
                        title={`Open ${sourceData.title} in nieuw tabblad`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {sourceData.title}
                      </a>
                    ) : (
                      <span className="font-montserrat font-semibold text-[16px] leading-normal text-gray-800">{sourceData.title}</span>
                    )}
                  </div>
                  {(sourceData.url || (sourceData.filePath && sourceData.isHtml)) && (
                    sourceData.url ? (
                      <a
                        href={sourceData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#23BD92] hover:text-[#1ea87c] hover:opacity-80 transition-colors"
                        title={`Open ${sourceData.title} in nieuw tabblad`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="currentColor" />
                        </svg>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenHtml(sourceData.filePath)
                        }}
                        className="text-[#23BD92] hover:text-[#1ea87c] hover:opacity-80 transition-colors p-1"
                        title="Open HTML-bestand"
                        aria-label="Open HTML-bestand"
                      >
                        <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="currentColor" />
                        </svg>
                      </button>
                    )
                  )}
                </div>

                {openUrl === urlKey && sourceData.snippets.length > 0 && (
                  <ul className="mt-3 space-y-2 pl-4 border-l-2 border-[#23BD92]/30">
                    {sourceData.snippets.map((snippet, i) => (
                      <li key={i} className="flex justify-between gap-4">
                        <div className="font-montserrat font-normal text-[14px] text-gray-700 flex-1">
                          {snippet.content.length > 150 ? snippet.content.slice(0, 150) + '...' : snippet.content}
                        </div>
                        {(sourceData.url || (sourceData.filePath && sourceData.isHtml)) && (
                          sourceData.url ? (
                            <a
                              href={sourceData.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#23BD92] hover:text-[#1ea87c] text-sm font-medium whitespace-nowrap shrink-0 transition-colors"
                              title={`Open ${sourceData.title} in nieuw tabblad`}
                            >
                              Bekijk bron
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenHtml(sourceData.filePath)}
                              className="text-[#23BD92] hover:text-[#1ea87c] text-sm font-medium whitespace-nowrap shrink-0 transition-colors"
                              title="Open HTML-bestand"
                            >
                              Bekijk bron
                            </button>
                          )
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default WebChatSourceList

