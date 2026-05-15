import React, { useState } from 'react';
import Link from 'next/link';
import DocumentViewer from './DocumentViewer';
import { useKeycloak } from '@react-keycloak/web';

// Prefer URL or short filename for display; avoid showing full server path
const getDisplayFileKey = (meta) => {
  const url = meta?.url || meta?.source_url
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) return url
  const name = meta?.file_name
  if (name) return name
  const path = meta?.file_path || meta?.original_file_path
  if (path && path.includes('/')) return path.split('/').pop()
  return path || 'unknown'
}

const groupByFileAndPage = (docs = []) => {
  if (!Array.isArray(docs)) return {};
  
  const grouped = {};
  docs.forEach((doc) => {
    const file = getDisplayFileKey(doc.meta);
    const page = doc.meta?.page_number || 1;
    
    if (!grouped[file]) grouped[file] = {};
    if (!grouped[file][page]) grouped[file][page] = [];
    
    const snippetExists = grouped[file][page].some(
      existing => (existing.snippet || existing.content) === (doc.content || doc.snippet)
    );
    
    if (!snippetExists) {
      grouped[file][page].push({
        snippet: doc.content || doc.snippet || '',
        content: doc.content || doc.snippet || '',
        page: page,
        meta: doc.meta || {}
      });
    }
  });
  return grouped;
};

/** Core list; `keycloak` is null on anonymous public chat (no ReactKeycloakProvider). */
function PdfSnippetListInner({ documents, publicChatContext = null, keycloak }) {
  const [openFile, setOpenFile] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null);
  const grouped = groupByFileAndPage(documents);

  const getFileExtension = (filename) => {
    return filename.toLowerCase().split('.').pop();
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

  const handleViewDocument = async (filePath, meta = {}) => {
    // Check if it's a URL (starts with http:// or https://)
    if (filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'))) {
      window.open(filePath, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Check if meta has a URL field (for public chat sources)
    if (meta.url && (meta.url.startsWith('http://') || meta.url.startsWith('https://'))) {
      window.open(meta.url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    const fileExtension = getFileExtension(filePath);
    const fileType = meta.type || '';
    const isHtml = fileType === 'html' || fileExtension === 'html'
    
    // For HTML files: use public download when publicChatContext, else company-admin
    if (isHtml) {
      try {
        if (publicChatContext?.companyAdmin && publicChatContext?.chatName) {
          // Public chat: use public endpoint (no auth) - /public-chat/{company_admin}/{chat_name}/download/{filename}
          const fileName = meta.file_name || (typeof filePath === 'string' ? filePath.split('/').pop() : '') || 'file.html'
          const url = `${baseUrl}/public-chat/${encodeURIComponent(publicChatContext.companyAdmin)}/${encodeURIComponent(publicChatContext.chatName)}/download/${encodeURIComponent(fileName)}`
          window.open(url, '_blank', 'noopener,noreferrer')
        } else if (keycloak?.authenticated) {
          // WebChat/DocumentChat: company-admin endpoint (requires auth)
          const actualPath = meta.original_file_path || meta.file_path || filePath
          const encodedPath = encodeURIComponent(actualPath)
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
          } else {
            console.error('Failed to download HTML file:', response.statusText)
          }
        } else {
          console.error('Cannot download HTML file: No authentication or public context available')
        }
      } catch (err) {
        console.error('Failed to open HTML file:', err)
      }
      return
    }
    
    // For PDFs, use the highlighted endpoint (if available)
    if (fileExtension === 'pdf') {
      // PDF viewing is handled by the Link component
      return;
    }
    
    // For Word documents: open in DocumentViewer when authenticated (shows in-browser)
    if (['doc', 'docx'].includes(fileExtension)) {
      const docMeta = documents.find(d => {
        const metaPath = d.meta?.file_path || d.meta?.file_name || '';
        return metaPath === filePath || metaPath.endsWith(filePath) || filePath.endsWith(metaPath);
      });
      const fileName = docMeta?.meta?.file_name || (typeof filePath === 'string' ? filePath.split('/').pop() : '') || 'document.docx';
      const actualPath = docMeta?.meta?.original_file_path || docMeta?.meta?.file_path || filePath;

      if (keycloak?.authenticated) {
        // Open in DocumentViewer (documents/download) - shows in-browser, no download
        setViewerDoc({ filePath: actualPath, fileName })
      } else if (publicChatContext?.companyAdmin && publicChatContext?.chatName) {
        // Public chat (no auth): open docx in Google Docs viewer so user can see it in-browser
        const publicFileUrl = `${baseUrl}/public-chat/${encodeURIComponent(publicChatContext.companyAdmin)}/${encodeURIComponent(publicChatContext.chatName)}/download/${encodeURIComponent(fileName)}`
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(publicFileUrl)}&embedded=true`
        window.open(viewerUrl, '_blank', 'noopener,noreferrer')
      }
    }
  };

  return (
    <div className='w-full flex flex-col gap-4'>
      { Array.isArray(documents) && documents.length > 0 && (
        <>
          <div className='flex items-center gap-3 mb-2'>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23BD92] to-[#1ea87c] flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className='font-montserrat font-bold text-[18px] leading-6 tracking-normal text-gray-800'>Bronnen</div>
            <div className="flex-1 h-px bg-gradient-to-r from-[#23BD92] to-transparent"></div>
            <span className="text-sm font-medium text-gray-500 font-montserrat">{documents.length} {documents.length === 1 ? 'bron' : 'bronnen'}</span>
          </div>
          <div className="space-y-3">
            {Object.entries(grouped).map(([file, pages], idx) => (
              <div key={file} className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-[#23BD92] transition-all duration-300 p-4 shadow-sm hover:shadow-md">
                <div className='w-full flex items-center justify-between'>
                  <div 
                    onClick={() => setOpenFile(openFile === file ? null : file)} 
                    className='flex w-fit items-center gap-3 cursor-pointer group hover:gap-4 transition-all duration-200'
                  >
                    <div className="w-6 h-6 rounded-md bg-gray-100 group-hover:bg-[#23BD92] flex items-center justify-center transition-colors duration-200">
                      {openFile === file  
                        ?  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#23BD92] group-hover:text-white transition-colors">
                              <path d="M5 8L9.33013 0.5L0.669873 0.5L5 8Z" fill="currentColor"/>
                            </svg>
                        :  <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 group-hover:text-white transition-colors">
                            <path d="M8 5L0.5 0.669872L0.5 9.33013L8 5Z" fill="currentColor"/>
                          </svg>
                      }
                    </div>

                    <div className="font-montserrat font-semibold text-[16px] leading-normal tracking-normal text-gray-800 group-hover:text-[#23BD92] transition-colors">
                      {file}
                    </div>
                  </div>

                  {(() => {
                    // Get the first document's meta to check for URL and type
                    const firstDoc = pages[Object.keys(pages)[0]]?.[0]
                    const meta = firstDoc?.meta || {}
                    const filePath = file
                    const fileType = meta.type || ''
                    const isUrl = filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'))
                    const hasUrl = meta.url && (meta.url.startsWith('http://') || meta.url.startsWith('https://'))
                    const isHtml = fileType === 'html' || getFileExtension(file) === 'html'
                    const isUrlType = fileType === 'url'
                    
                    // Show open icon for URLs, HTML files, or if meta has a URL
                    if (isUrl || hasUrl || isHtml || isUrlType) {
                      // It's a URL or HTML - open in new tab
                      return (
                        <button
                          onClick={() => handleViewDocument(filePath, meta)}
                          className="cursor-pointer p-2 rounded-lg hover:bg-[#E5F9F4] transition-all duration-200 group"
                          title={isHtml ? "Open HTML file" : "Open URL"}
                        >
                          <svg width="20" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                            <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92" className="group-hover:fill-[#1ea87c] transition-colors"/>
                          </svg>
                        </button>
                      )
                    } else if (getFileExtension(file) === 'pdf') {
                      // For public chat PDFs, check if we have original_file_path or file_path
                      // If it's a public chat source, we need to use a different endpoint
                      const originalPath = meta.original_file_path || meta.file_path
                      const isPublicChat = originalPath && (originalPath.includes('public_chat') || meta.type === 'file')
                      
                      if (isPublicChat && publicChatContext) {
                        // For public chat PDFs, use highlighted endpoint (same as DocumentChat)
                        // The backend creates highlighted PDFs during query processing
                        const fileName = meta.file_name || file.split('/').pop() || file
                        const firstPage = Object.keys(pages)[0] || 1
                        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
                        const url = `${baseUrl}/highlighted/${encodeURIComponent(fileName)}#page=${firstPage}`
                        
                        return (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg hover:bg-[#E5F9F4] transition-all duration-200 group inline-block"
                            title="Open PDF"
                          >
                            <svg width="20" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                              <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92" className="group-hover:fill-[#1ea87c] transition-colors"/>
                            </svg>
                          </a>
                        )
                      } else if (isPublicChat && !publicChatContext) {
                        // Fallback for public chat without context (shouldn't happen, but handle gracefully)
                        return (
                          <button
                            onClick={async () => {
                              try {
                                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
                                const encodedPath = encodeURIComponent(originalPath)
                                const url = `${baseUrl}/company-admin/documents/download?file_path=${encodedPath}`
                                
                                const headers = {}
                                if (keycloak?.authenticated && keycloak.token) {
                                  headers.Authorization = `Bearer ${keycloak.token}`
                                }
                                
                                const response = await fetch(url, { headers })
                                
                                if (response.ok) {
                                  const blob = await response.blob()
                                  const blobUrl = window.URL.createObjectURL(blob)
                                  window.open(blobUrl, '_blank')
                                  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100)
                                } else {
                                  console.error('Failed to open PDF:', response.statusText)
                                }
                              } catch (err) {
                                console.error('Failed to open PDF:', err)
                              }
                            }}
                            className="cursor-pointer p-2 rounded-lg hover:bg-[#E5F9F4] transition-all duration-200 group"
                            title="Open PDF"
                          >
                            <svg width="20" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                              <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92" className="group-hover:fill-[#1ea87c] transition-colors"/>
                            </svg>
                          </button>
                        )
                      } else {
                        // For regular PDFs (DocumentChat), use highlighted endpoint - simple link like before
                        return (
                          <Link
                            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/highlighted/${encodeURIComponent(file)}#page=${Object.keys(pages)[0]}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg hover:bg-[#E5F9F4] transition-all duration-200 group inline-block"
                          >
                            <svg width="20" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                              <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92" className="group-hover:fill-[#1ea87c] transition-colors"/>
                            </svg>
                          </Link>
                        )
                      }
                    } else if (['doc', 'docx'].includes(getFileExtension(file))) {
                      return (
                        <button
                          onClick={() => handleViewDocument(file, meta)}
                          className="cursor-pointer p-2 rounded-lg hover:bg-[#E5F9F4] transition-all duration-200 group"
                          title="Bekijk Word document"
                        >
                          <svg width="20" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                            <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92" className="group-hover:fill-[#1ea87c] transition-colors"/>
                          </svg>
                        </button>
                      )
                    } else {
                      return (
                        <span className="text-gray-400 text-xs" title="Weergave niet beschikbaar voor dit bestandstype">
                          -
                        </span>
                      )
                    }
                  })()}
                </div>

                {openFile === file && (
                  <ul className="mt-4 space-y-3 pl-4 border-l-3 border-[#23BD92] animate-fade-in">
                    {Object.entries(pages).map(([pageNumber, snippets]) => {
                      const firstSnippet = snippets[0]
                      const meta = firstSnippet?.meta || {}
                      const isUrl = file && (file.startsWith('http://') || file.startsWith('https://'))
                      const hasUrl = meta.url && (meta.url.startsWith('http://') || meta.url.startsWith('https://'))
                      
                      return snippets.map((item, i) => (
                        <li key={`${pageNumber}-${i}`} className='flex justify-between items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                          <div className="font-montserrat font-normal text-[13px] leading-relaxed text-gray-700 flex-1">
                            {item.snippet && item.snippet.length > 100
                              ? item.snippet.slice(0, 100) + '...'
                              : item.snippet || item.content || 'Bron'}
                          </div>

                          {isUrl || hasUrl ? (
                            <button
                              onClick={() => handleViewDocument(file, meta)}
                              className='text-[10px] lg:text-[12px] text-[#8F8989] hover:text-[#23BD92] cursor-pointer'
                            >
                              Open
                            </button>
                          ) : getFileExtension(file) === 'pdf' ? (
                            (() => {
                              // Check if it's a public chat PDF
                              const firstDoc = pages[Object.keys(pages)[0]]?.[0]
                              const docMeta = firstDoc?.meta || {}
                              const originalPath = docMeta.original_file_path || docMeta.file_path
                              const isPublicChat = originalPath && (originalPath.includes('public_chat') || docMeta.type === 'file')
                              
                              if (isPublicChat && publicChatContext) {
                                // Use highlighted endpoint (same as DocumentChat)
                                const fileName = docMeta.file_name || file.split('/').pop() || file
                                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
                                const url = `${baseUrl}/highlighted/${encodeURIComponent(fileName)}#page=${pageNumber}`
                                
                                return (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className='text-[10px] lg:text-[12px] text-[#8F8989] hover:text-[#23BD92] cursor-pointer'
                                  >
                                    pagina {pageNumber}
                                  </a>
                                )
                              } else {
                                // Use regular highlighted endpoint
                                return (
                                  <Link
                                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/highlighted/${encodeURIComponent(file)}#page=${pageNumber}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >  
                                    <div className='text-[10px] lg:text-[12px] text-[#8F8989]'>pagina {pageNumber}</div>
                                  </Link>
                                )
                              }
                            })()
                          ) : (
                            <div className='text-[10px] lg:text-[12px] text-[#8F8989]'>-</div>
                          )} 
                        </li>
                      ))
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Document Viewer Modal for Word files */}
      {viewerDoc && keycloak?.authenticated && (
        <DocumentViewer
          filePath={viewerDoc.filePath}
          fileName={viewerDoc.fileName}
          apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}
          authToken={keycloak.token}
          onClose={() => setViewerDoc(null)}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function PdfSnippetListWithKeycloak(props) {
  const { keycloak } = useKeycloak();
  return <PdfSnippetListInner {...props} keycloak={keycloak} />;
}

/**
 * Anonymous `/publicChat` pages mount outside ReactKeycloakProvider — avoid useKeycloak when
 * `publicChatContext` has admin + chat name (same shape PublicChatPage passes).
 */
export default function PdfSnippetList(props) {
  const pc = props.publicChatContext;
  if (pc?.companyAdmin && pc?.chatName) {
    return <PdfSnippetListInner {...props} keycloak={null} />;
  }
  return <PdfSnippetListWithKeycloak {...props} />;
}