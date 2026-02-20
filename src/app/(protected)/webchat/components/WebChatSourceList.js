'use client'

import { useState } from 'react'

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
  const [openUrl, setOpenUrl] = useState(null)
  const grouped = groupSourcesByUrl(sources)

  return (
    <div className='w-full flex flex-col gap-[11px]'>
      {Array.isArray(sources) && sources.length > 0 && (
        <>
          <div className='font-montserrat font-bold text-[16px] leading-6 tracking-normal'>
            Bronnen
          </div>
          <div>
            {Object.entries(grouped).map(([urlKey, sourceData], idx) => (
              <div key={urlKey} className="border-t-2 border-t-[#C5BEBE] py-2">
                <div className='w-full flex items-center justify-between'>
                  <div className='flex w-fit items-center gap-2'>
                    {/* Expand/Collapse arrow */}
                    <div 
                      onClick={() => setOpenUrl(openUrl === urlKey ? null : urlKey)} 
                      className='cursor-pointer'
                    >
                      {openUrl === urlKey ? (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 8L9.33013 0.5L0.669873 0.5L5 8Z" fill="black"/>
                        </svg>
                      ) : (
                        <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5L0.5 0.669872L0.5 9.33013L8 5Z" fill="black"/>
                        </svg>
                      )}
                    </div>

                    {/* Clickable title that opens URL */}
                    {sourceData.url ? (
                      <a
                        href={sourceData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-montserrat font-normal text-[15px] leading-normal tracking-normal text-[#23BD92] hover:text-[#1ea87c] hover:underline transition-colors"
                        title={`Open ${sourceData.title} in nieuw tabblad`}
                        onClick={(e) => e.stopPropagation()} // Prevent collapsing when clicking title
                      >
                        {sourceData.title}
                      </a>
                    ) : (
                      <div className="font-montserrat font-normal text-[15px] leading-normal tracking-normal">
                        {sourceData.title}
                      </div>
                    )}
                  </div>

                  {/* View icon (similar to DocumentChat) */}
                  {sourceData.url && (
                    <a
                      href={sourceData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#23BD92] hover:text-[#1ea87c] flex-shrink-0 transition-colors"
                      title={`Open ${sourceData.title} in nieuw tabblad`}
                      onClick={(e) => e.stopPropagation()} // Prevent collapsing when clicking icon
                    >
                      <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="currentColor"/>
                      </svg>
                    </a>
                  )}
                </div>

                {/* Expanded snippets section */}
                {openUrl === urlKey && sourceData.snippets.length > 0 && (
                  <ul className="my-3 space-y-2 pl-4 border-l-2 border-gray-300">
                    {sourceData.snippets.map((snippet, i) => (
                      <li key={i} className='flex justify-between'>
                        <div className="font-montserrat font-normal text-[12px] text-gray-700 flex-1">
                          {snippet.content.length > 100
                            ? snippet.content.slice(0, 100) + '...'
                            : snippet.content}
                        </div>
                        {sourceData.url && (
                          <a
                            href={sourceData.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#23BD92] hover:text-[#1ea87c] text-[10px] lg:text-[12px] font-medium whitespace-nowrap flex-shrink-0 transition-colors"
                            title={`Open ${sourceData.title} in nieuw tabblad`}
                          >
                            Bekijk bron
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <div className="h-0.5 w-full bg-[#C5BEBE]"></div>
          </div>
        </>
      )}
    </div>
  )
}

export default WebChatSourceList

