'use client';

import { useState, useEffect } from 'react';
import mammoth from 'mammoth';

/**
 * DocumentViewer component that handles viewing different file types in the browser.
 * - PDFs: Opens directly in browser (native support)
 * - Word documents (.docx): Converts to HTML using mammoth.js
 * - Legacy Word (.doc): Shows message to download
 */
export default function DocumentViewer({ filePath, fileName, apiBaseUrl, authToken, onClose }) {
  const [viewerUrl, setViewerUrl] = useState(null);
  const [htmlContent, setHtmlContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filePath) return;

    const fileExtension = (fileName || filePath).toLowerCase().split('.').pop();
    
    // Check if it's a PDF - can be viewed directly
    if (fileExtension === 'pdf') {
      // Use the download endpoint as URL for PDF
      const encodedPath = encodeURIComponent(filePath);
      const url = `${apiBaseUrl || 'http://localhost:8000'}/company-admin/documents/download?file_path=${encodedPath}`;
      setViewerUrl(url);
      setIsLoading(false);
      return;
    }

    // For Word documents (.docx), convert to HTML
    if (fileExtension === 'docx') {
      if (!authToken) {
        setError('Authenticatie vereist. Log opnieuw in.');
        setIsLoading(false);
        return;
      }
      loadAndConvertWord(filePath);
    } 
    // Legacy .doc format - cannot be converted easily
    else if (fileExtension === 'doc') {
      setError('Legacy Word format (.doc) wordt niet ondersteund voor weergave in de browser. Download het bestand om het te bekijken.');
      setIsLoading(false);
    } else {
      setError('Dit bestandstype kan niet in de browser worden bekeken.');
      setIsLoading(false);
    }
  }, [filePath, fileName, apiBaseUrl, authToken]);

  const loadAndConvertWord = async (path) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch the Word document
      const encodedPath = encodeURIComponent(path);
      const url = `${apiBaseUrl || 'http://localhost:8000'}/company-admin/documents/download?file_path=${encodedPath}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...(typeof window !== 'undefined' && window.localStorage.getItem('daviActingOwnerId') 
            ? { 'X-Acting-Owner-Id': window.localStorage.getItem('daviActingOwnerId') }
            : {}),
          ...(typeof window !== 'undefined' && window.localStorage.getItem('daviActingOwnerIsGuest') === 'true'
            ? { 'X-Acting-Owner-Is-Guest': 'true' }
            : {})
        }
      });

      if (!response.ok) {
        // Try to get error details
        let errorText = response.statusText;
        try {
          const text = await response.text();
          try {
            const json = JSON.parse(text);
            errorText = json.detail || json.message || text;
          } catch {
            errorText = text.substring(0, 200);
          }
        } catch {
          // Use default status text
        }
        throw new Error(`Failed to load document (${response.status}): ${errorText}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';
      console.log('Response content-type:', contentType);
      
      if (contentType.includes('application/json')) {
        // Likely an error response
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.detail || json.message || 'Server returned an error');
        } catch {
          throw new Error('Server returned JSON instead of the document');
        }
      }
      
      if (contentType.includes('text/html')) {
        // Likely an error page or redirect
        const text = await response.text();
        if (text.includes('404') || text.includes('Not Found')) {
          throw new Error('Document not found on server');
        }
        if (text.includes('403') || text.includes('Forbidden')) {
          throw new Error('Access denied to this document');
        }
        throw new Error('Server returned HTML instead of the document');
      }

      // Get the file as array buffer
      const arrayBuffer = await response.arrayBuffer();
      
      // Validate that we have actual data
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('Empty file received');
      }

      // Check if it's a valid ZIP/DOCX file by checking the magic bytes
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Log file info for debugging
      console.log('File received:', {
        size: arrayBuffer.byteLength,
        firstBytes: Array.from(uint8Array.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
        contentType: response.headers.get('content-type'),
        path: path
      });
      
      // DOCX files start with PK (ZIP signature): 0x50 0x4B
      if (uint8Array.length < 2 || uint8Array[0] !== 0x50 || uint8Array[1] !== 0x4B) {
        // Check if it might be HTML/error response
        const text = new TextDecoder().decode(uint8Array.slice(0, 500));
        if (text.trim().startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<html')) {
          console.error('Server returned HTML:', text.substring(0, 200));
          throw new Error('Server returned HTML instead of the document. Please check file access.');
        }
        // Check if it's JSON error
        if (text.trim().startsWith('{') && text.includes('"detail"')) {
          try {
            const json = JSON.parse(text);
            throw new Error(json.detail || 'Server returned an error response');
          } catch (e) {
            // Not valid JSON, continue
          }
        }
        // Show first few bytes for debugging
        const hexPreview = Array.from(uint8Array.slice(0, 20))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');
        console.error('Invalid DOCX file - First 20 bytes (hex):', hexPreview);
        console.error('Expected DOCX file to start with: 50 4B (PK - ZIP signature)');
        throw new Error(`Invalid DOCX file format. The file may be corrupted or not a DOCX file. Check browser console for details.`);
      }
      
      // Convert Word document to HTML
      let result;
      try {
        result = await mammoth.convertToHtml({ arrayBuffer }, {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
          ]
        });
      } catch (conversionError) {
        // If conversion fails, it might be that the file isn't actually a DOCX
        console.error('Mammoth conversion error:', conversionError);
        throw new Error('Kon Word document niet converteren. Het bestand is mogelijk geen geldig DOCX-bestand of is beschadigd.');
      }

      setHtmlContent(result.value);
      
      if (result.messages.length > 0) {
        console.warn('Word conversion warnings:', result.messages);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to convert Word document:', err);
      const errorMessage = err.message || 'Kon Word document niet laden. Probeer het opnieuw of download het bestand.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (!filePath) return null;

  const fileExtension = (fileName || filePath).toLowerCase().split('.').pop();
  const isPdf = fileExtension === 'pdf';
  const isWordDocx = fileExtension === 'docx';
  const isWordDoc = fileExtension === 'doc';

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold font-montserrat text-gray-800">
            {fileName || 'Document Viewer'}
          </h2>
          <div className="flex items-center gap-2">
            {/* Download button for Word documents */}
            {isWordDocx && !isLoading && !error && (
              <button
                onClick={async () => {
                  try {
                    const encodedPath = encodeURIComponent(filePath);
                    const url = `${apiBaseUrl || 'http://localhost:8000'}/company-admin/documents/download?file_path=${encodedPath}`;
                    
                    const response = await fetch(url, {
                      headers: {
                        'Authorization': `Bearer ${authToken}`,
                        ...(typeof window !== 'undefined' && window.localStorage.getItem('daviActingOwnerId') 
                          ? { 'X-Acting-Owner-Id': window.localStorage.getItem('daviActingOwnerId') }
                          : {}),
                        ...(typeof window !== 'undefined' && window.localStorage.getItem('daviActingOwnerIsGuest') === 'true'
                          ? { 'X-Acting-Owner-Is-Guest': 'true' }
                          : {})
                      }
                    });

                    if (!response.ok) {
                      throw new Error('Failed to download document');
                    }

                    const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = fileName || 'document.docx';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                  } catch (err) {
                    console.error('Failed to download document:', err);
                    alert('Kon document niet downloaden. Probeer het opnieuw.');
                  }
                }}
                className="text-gray-600 hover:text-[#23BD92] p-2 rounded hover:bg-gray-100 transition-colors"
                title="Download document"
                aria-label="Download document"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-t-[#23BD92] border-[#F9FBFA] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-montserrat">Document laden...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-white">
              <div className="text-center max-w-md">
                <p className="text-red-600 mb-4 font-montserrat">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#23BD92] text-white rounded hover:bg-[#1ea87a] font-montserrat"
                >
                  Sluiten
                </button>
              </div>
            </div>
          )}

          {!error && !isLoading && (
            <>
              {isPdf && viewerUrl ? (
                <iframe
                  src={viewerUrl}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setError('Kon PDF niet laden. Probeer het opnieuw.');
                    setIsLoading(false);
                  }}
                />
              ) : isWordDocx && htmlContent ? (
                <div className="w-full h-full overflow-auto p-8 bg-white">
                  <div 
                    className="prose max-w-none font-montserrat"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: '1.6',
                      color: '#333'
                    }}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

