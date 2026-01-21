import React, { useState } from 'react';
import Link from 'next/link';
import DocumentViewer from './DocumentViewer';
import { useKeycloak } from '@react-keycloak/web';

const groupByFileAndPage = (docs = []) => {
  if (!Array.isArray(docs)) return {};
  
  const grouped = {};
  docs.forEach((doc) => {
    const file = doc.meta.file_path;
    const page = doc.meta.page_number;
    
    if (!grouped[file]) grouped[file] = {};
    if (!grouped[file][page]) grouped[file][page] = [];
    
    const snippetExists = grouped[file][page].some(
      existing => existing.snippet === doc.content
    );
    
    if (!snippetExists) {
      grouped[file][page].push({
        snippet: doc.content,
        page: page,
      });
    }
  });
  return grouped;
};

const PdfSnippetList = ({ documents }) => {
  const { keycloak } = useKeycloak();
  const [openFile, setOpenFile] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null);
  const grouped = groupByFileAndPage(documents);

  const getFileExtension = (filename) => {
    return filename.toLowerCase().split('.').pop();
  };

  const handleViewDocument = (filePath) => {
    // For PDFs, use the highlighted endpoint (if available)
    const fileExtension = getFileExtension(filePath);
    if (fileExtension === 'pdf') {
      // PDF viewing is handled by the Link component
      return;
    }
    
    // For Word documents, open in viewer
    if (['doc', 'docx'].includes(fileExtension)) {
      // Find the document metadata to get the original file path if available
      const docMeta = documents.find(d => {
        const metaPath = d.meta?.file_path || d.meta?.file_name || '';
        return metaPath === filePath || metaPath.endsWith(filePath) || filePath.endsWith(metaPath);
      });
      
      // Use original_file_path if available, otherwise use file_path, otherwise use the provided path
      const actualPath = docMeta?.meta?.original_file_path || docMeta?.meta?.file_path || filePath;
      const fileName = docMeta?.meta?.file_name || filePath.split('/').pop() || filePath;
      
      setViewerDoc({
        filePath: actualPath,
        fileName: fileName
      });
    }
  };

  return (
    <div className='w-full flex flex-col gap-[11px]'>
      { Array.isArray(documents) && documents.length > 0 && (
        <>
          <div className='font-montserrat font-bold text-[16px] leading-6 tracking-normal'>Bronnen</div>
          <div>
            {Object.entries(grouped).map(([file, pages], idx) => (
              <div key={file} className="border-t-2 border-t-[#C5BEBE] py-2">
                <div className='w-full flex items-center justify-between'>
                  <div onClick={() => setOpenFile(openFile === file ? null : file)} className='flex w-fit items-center gap-2 cursor-pointer'>
                    {openFile === file  
                      ?  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 8L9.33013 0.5L0.669873 0.5L5 8Z" fill="black"/>
                          </svg>
                      :  <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5L0.5 0.669872L0.5 9.33013L8 5Z" fill="black"/>
                        </svg>
                    }

                    <div className="font-montserrat font-normal text-[15px] leading-normal tracking-normal">
                      {file}
                    </div>
                  </div>

                  {getFileExtension(file) === 'pdf' ? (
                    <Link
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/highlighted/${encodeURIComponent(file)}#page=${Object.keys(pages)[0]}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92"/>
                      </svg>
                    </Link>
                  ) : ['doc', 'docx'].includes(getFileExtension(file)) ? (
                    <button
                      onClick={() => handleViewDocument(file)}
                      className="cursor-pointer"
                      title="Bekijk Word document"
                    >
                      <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0.5V19.5H19V0.5H0ZM8.97196 16.3333H3.16667V10.528L4.95029 12.3109L7.32688 9.94458L9.56571 12.1834L7.18913 14.5497L8.97196 16.3333ZM15.8333 9.47196L14.0497 7.68913L11.7388 10L9.5 7.76117L11.8109 5.45029L10.028 3.66667H15.8333V9.47196Z" fill="#23BD92"/>
                      </svg>
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs" title="Weergave niet beschikbaar voor dit bestandstype">
                      -
                    </span>
                  )}
                </div>

                {openFile === file && (
                  <ul className="my-3 space-y-2 pl-4 border-l-2 border-gray-300">
                    {Object.entries(pages).map(([pageNumber, snippets]) => (
                      snippets.map((item, i) => (
                        <li key={`${pageNumber}-${i}`} className='flex justify-between'>
                          <div className="font-montserrat font-normal text-[12px]">
                            {item.snippet.length > 100
                              ? item.snippet.slice(0, 100) + '...'
                              : item.snippet}
                          </div>

                          {getFileExtension(file) === 'pdf' ? (
                            <Link
                              href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/highlighted/${encodeURIComponent(file)}#page=${pageNumber}`}
                              target="_blank"
                              rel="noreferrer"
                            >  
                              <div className='text-[10px] lg:text-[12px] text-[#8F8989]'>pagina {pageNumber}</div>
                            </Link>
                          ) : (
                            <div className='text-[10px] lg:text-[12px] text-[#8F8989]'>-</div>
                          )} 
                        </li>
                      ))
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <div className="h-0.5 w-full bg-[#C5BEBE]"></div>
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
    </div>
  );
};

export default PdfSnippetList;