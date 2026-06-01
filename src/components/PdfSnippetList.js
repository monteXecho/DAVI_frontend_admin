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

/** Shorter label for narrow viewports; full string stays in ``title``. */
const formatSourceLabel = (file, { compact = false } = {}) => {
  if (!file) return 'Onbekende bron'
  if (!compact) return file
  if (file.startsWith('http://') || file.startsWith('https://')) {
    try {
      const u = new URL(file)
      const host = u.hostname.replace(/^www\./, '')
      const path = `${u.pathname}${u.search}` || '/'
      if (path === '/') return host
      const combined = `${host}${path}`
      if (combined.length <= 48) return combined
      return `${host}${path.slice(0, Math.max(8, 40 - host.length))}…`
    } catch {
      /* fall through */
    }
  }
  if (file.length <= 48) return file
  const ext = file.includes('.') ? file.slice(file.lastIndexOf('.')) : ''
  const base = file.slice(0, file.length - ext.length)
  return `${base.slice(0, 36)}…${ext}`
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
    <div className="w-full min-w-0 flex flex-col gap-4">
      { Array.isArray(documents) && documents.length > 0 && (
        <>
          <div className="mb-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#23BD92] to-[#1ea87c] shadow-sm">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="font-montserrat text-base font-bold leading-6 tracking-normal text-gray-800 sm:text-[18px]">Bronnen</div>
            </div>
            <div className="hidden h-px flex-1 bg-gradient-to-r from-[#23BD92] to-transparent sm:block" />
            <span className="font-montserrat text-sm font-medium text-gray-500 sm:shrink-0">
              {documents.length} {documents.length === 1 ? 'bron' : 'bronnen'}
            </span>
          </div>
          <div className="space-y-3">
            {Object.entries(grouped).map(([file, pages], idx) => {
              const firstDoc = pages[Object.keys(pages)[0]]?.[0]
              const meta = firstDoc?.meta || {}
              const filePath = file
              const fileType = meta.type || ''
              const isUrl = filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'))
              const hasUrl = meta.url && (meta.url.startsWith('http://') || meta.url.startsWith('https://'))
              const isHtml = fileType === 'html' || getFileExtension(file) === 'html'
              const isUrlType = fileType === 'url'

              const openAction = (() => {
                if (isUrl || hasUrl || isHtml || isUrlType) {
                  return (
                    <button
                      onClick={() => handleViewDocument(filePath, meta)}
                      className="group shrink-0 cursor-pointer rounded-lg p-2 transition-all duration-200 hover:bg-[#E5F9F4]"
                      title={isHtml ? 'Open HTML file' : 'Open URL'}
                      type="button"
                    >
                      <svg width="20" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
                        <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92" className="transition-colors group-hover:fill-[#1ea87c]" />
                      </svg>
                    </button>
                  )
                }
                if (getFileExtension(file) === 'pdf') {
                  const originalPath = meta.original_file_path || meta.file_path
                  const isPublicChat = originalPath && (originalPath.includes('public_chat') || meta.type === 'file')
                  if (isPublicChat && publicChatContext) {
                    const fileName = meta.file_name || file.split('/').pop() || file
                    const firstPage = Object.keys(pages)[0] || 1
                    const url = `${baseUrl}/highlighted/${encodeURIComponent(fileName)}#page=${firstPage}`
                    return (
                      <a href={url} target="_blank" rel="noreferrer" className="group inline-block shrink-0 rounded-lg p-2 transition-all duration-200 hover:bg-[#E5F9F4]" title="Open PDF">
                        <svg width="20" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
                          <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92" className="transition-colors group-hover:fill-[#1ea87c]" />
                        </svg>
                      </a>
                    )
                  }
                  if (isPublicChat && !publicChatContext) {
                    return (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
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
                            }
                          } catch (err) {
                            console.error('Failed to open PDF:', err)
                          }
                        }}
                        className="group shrink-0 cursor-pointer rounded-lg p-2 transition-all duration-200 hover:bg-[#E5F9F4]"
                        title="Open PDF"
                      >
                        <svg width="20" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
                          <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92" className="transition-colors group-hover:fill-[#1ea87c]" />
                        </svg>
                      </button>
                    )
                  }
                  return (
                    <Link
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/highlighted/${encodeURIComponent(file)}#page=${Object.keys(pages)[0]}`}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-block shrink-0 rounded-lg p-2 transition-all duration-200 hover:bg-[#E5F9F4]"
                    >
                      <svg width="20" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
                        <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92" className="transition-colors group-hover:fill-[#1ea87c]" />
                      </svg>
                    </Link>
                  )
                }
                if (['doc', 'docx'].includes(getFileExtension(file))) {
                  return (
                    <button
                      type="button"
                      onClick={() => handleViewDocument(file, meta)}
                      className="group shrink-0 cursor-pointer rounded-lg p-2 transition-all duration-200 hover:bg-[#E5F9F4]"
                      title="Bekijk Word document"
                    >
                      <svg width="20" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
                        <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92" className="transition-colors group-hover:fill-[#1ea87c]" />
                      </svg>
                    </button>
                  )
                }
                return (
                  <span className="shrink-0 text-xs text-gray-400" title="Weergave niet beschikbaar voor dit bestandstype">-</span>
                )
              })()

              return (
              <div key={file} className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-3 shadow-sm transition-all duration-300 hover:border-[#23BD92] hover:shadow-md sm:p-4">
                {/* Mobile: actions on top; desktop: single row */}
                <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFile(openFile === file ? null : file)}
                      className="group flex min-w-0 flex-1 items-center gap-2 text-left"
                      aria-expanded={openFile === file}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 transition-colors duration-200 group-hover:bg-[#23BD92]">
                        {openFile === file ? (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#23BD92] transition-colors group-hover:text-white">
                            <path d="M5 8L9.33013 0.5L0.669873 0.5L5 8Z" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 transition-colors group-hover:text-white">
                            <path d="M8 5L0.5 0.669872L0.5 9.33013L8 5Z" fill="currentColor" />
                          </svg>
                        )}
                      </div>
                      <span className="font-montserrat text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Bron {idx + 1}
                      </span>
                    </button>
                    {openAction}
                  </div>

                  <div
                    onClick={() => setOpenFile(openFile === file ? null : file)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setOpenFile(openFile === file ? null : file)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group hidden min-w-0 flex-1 cursor-pointer items-center gap-3 transition-all duration-200 hover:gap-4 sm:flex"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 transition-colors duration-200 group-hover:bg-[#23BD92]">
                      {openFile === file ? (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#23BD92] transition-colors group-hover:text-white">
                          <path d="M5 8L9.33013 0.5L0.669873 0.5L5 8Z" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 transition-colors group-hover:text-white">
                          <path d="M8 5L0.5 0.669872L0.5 9.33013L8 5Z" fill="currentColor" />
                        </svg>
                      )}
                    </div>
                    <div
                      className="min-w-0 flex-1 font-montserrat text-base font-semibold leading-snug tracking-normal text-gray-800 transition-colors group-hover:text-[#23BD92] break-all"
                      title={file}
                    >
                      {file}
                    </div>
                  </div>

                  <div className="hidden shrink-0 sm:block">{openAction}</div>

                  <div
                    className="min-w-0 font-montserrat text-sm font-semibold leading-snug text-gray-800 break-all sm:hidden"
                    title={file}
                  >
                    {file.length > 56 ? formatSourceLabel(file, { compact: true }) : file}
                  </div>
                </div>

                {openFile === file && (
                  <ul className="mt-4 space-y-3 pl-4 border-l-3 border-[#23BD92] animate-fade-in">
                    {Object.entries(pages).map(([pageNumber, snippets]) => {
                      const firstSnippet = snippets[0]
                      const meta = firstSnippet?.meta || {}
                      const isUrl = file && (file.startsWith('http://') || file.startsWith('https://'))
                      const hasUrl = meta.url && (meta.url.startsWith('http://') || meta.url.startsWith('https://'))
                      
                      return snippets.map((item, i) => (
                        <li key={`${pageNumber}-${i}`} className="flex flex-col gap-2 rounded-lg p-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0 flex-1 break-words font-montserrat text-[13px] font-normal leading-relaxed text-gray-700">
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
            )})}
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