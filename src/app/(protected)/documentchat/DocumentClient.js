'use client';

import { useRef, useState, useEffect } from 'react';
import AutoGrowingTextarea from '@/components/AutoGrowingTextarea';
import PdfSnippetList from '@/components/PdfSnippetList';
import { useApi } from '@/lib/useApi';
import UploadBttn from '@/components/buttons/UploadBttn';
import UploadingBttn from '@/components/buttons/UploadingBttn';
import SuccessBttn from '@/components/buttons/SuccessBttn';
import { ToastContainer, toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import { filterDocumentsByCitations } from '@/lib/utils/citations';
     
const UploadStates = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const CHAT_HISTORY_KEY = 'documentchat_history';

export default function DocumentClient() {
  const { askQuestion, uploadDocument, loading: apiLoading, error } = useApi();

  // Chat history: array of { question, answer, documents, timestamp }
  const [chatHistory, setChatHistory] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(UploadStates.IDLE);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [successfulUploads, setSuccessfulUploads] = useState([]);
  const [failedUploads, setFailedUploads] = useState([]);
  const [loadingCardVisible, setLoadingCardVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const fileInputRef = useRef(null);

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    try {
      const savedHistory = sessionStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setChatHistory(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }, []);

  // Save chat history to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
    } catch (err) {
      console.error('Failed to save chat history:', err);
    }
  }, [chatHistory]);

  const handleQuestionSubmit = async (questionText) => {
    if (!questionText.trim()) return;

    setCurrentQuestion(questionText);
    setLoadingCardVisible(true);

    try {
      const data = await askQuestion(questionText);
      const answer = data.answer || '';
      const allDocuments = data.documents || [];
      
      // Filter documents to only include cited ones
      // This is a safety measure - backend should already filter, but we ensure correctness here
      const documents = filterDocumentsByCitations(allDocuments, answer);
      
      // Add new message to history instead of replacing
      const newMessage = {
        question: questionText,
        answer: answer,
        documents: documents,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, newMessage]);
      setCurrentQuestion('');
    } catch (err) {
      console.error('Failed to fetch answer:', err);
      const errorMessage = 'Er is een fout opgetreden bij het ophalen van het antwoord.';
      
      // Add error message to history
      const errorMessageObj = {
        question: questionText,
        answer: errorMessage,
        documents: [],
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, errorMessageObj]);
      setCurrentQuestion('');
    } finally {
      setLoadingCardVisible(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDocumentUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Reset states
    setUploadedFiles(files);
    setUploadStatus(UploadStates.UPLOADING);
    setSuccessfulUploads([]);
    setFailedUploads([]);
    setCurrentFileIndex(0);

    await uploadAllFiles(files);
  };

  const uploadAllFiles = async (files) => {
    const successful = [];
    const failed = [];
    
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      setCurrentFileIndex(fileIndex);
      const file = files[fileIndex];
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const { success, data, message } = await uploadDocument(formData, 'document');
        
        if (success) {
          successful.push({
            file: file.name,
            data
          });
        } else {
          const errorMessage = message || 'Upload mislukt';
          failed.push({
            file: file.name,
            error: errorMessage
          });
          toast.warn(`Upload mislukt voor ${file.name}: ${errorMessage}`);
        }
      } catch (err) {
        console.error(`Upload error for ${file.name}:`, err);
        const errorMessage = err.message || 'Upload mislukt';
        failed.push({
          file: file.name,
          error: errorMessage
        });
        toast.warn(`Upload van ${file.name} is mislukt: ${errorMessage}`);
      }
    }

    // Update states
    setSuccessfulUploads(successful);
    setFailedUploads(failed);
    
    // Determine final status
    if (failed.length === 0 && successful.length > 0) {
      setUploadStatus(UploadStates.SUCCESS);
      if (successful.length > 1) {
        toast.success(`${successful.length} documenten succesvol geüpload`);
      }
    } else if (successful.length > 0) {
      setUploadStatus(UploadStates.ERROR);
      toast.error("Sommige uploads zijn mislukt. Kijk in de notificaties voor details.");
    } else {
      setUploadStatus(UploadStates.ERROR);
      toast.error("Alle uploads zijn mislukt.");
    }
  };

  const renderUploadSection = () => {
    switch (uploadStatus) {
      case UploadStates.IDLE:
        return <UploadBttn onClick={handleUploadClick} text='Upload documenten' />

      case UploadStates.UPLOADING:
        const currentFile = uploadedFiles[currentFileIndex];
        const totalFiles = uploadedFiles.length;
        
        let progressText = "";
        if (totalFiles > 1) {
          progressText = `Bestand ${currentFileIndex + 1}/${totalFiles}: ${currentFile.name} - Bezig met uploaden...`;
        } else {
          progressText = `${currentFile.name} - Bezig met uploaden...`;
        }
        
        return <UploadingBttn text={progressText} />

      case UploadStates.SUCCESS:
        const uniqueFiles = [...new Set(successfulUploads.map(u => u.file))];
        
        return (
          <div className="flex flex-col gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800 font-semibold mb-2">
                Successvol geüpload ({uniqueFiles.length} documenten):
              </div>
              <div className="text-green-700 text-sm">
                {uniqueFiles.map((fileName, index) => (
                  <div key={index} className="ml-2">
                    • {fileName}
                  </div>
                ))}
              </div>
            </div>
            <UploadBttn onClick={handleUploadClick} text='Meer documenten uploaden' />
          </div>
        )

      case UploadStates.ERROR:
        if (successfulUploads.length > 0) {
          const uniqueFiles = [...new Set(successfulUploads.map(u => u.file))];
          return (
            <div className="flex flex-col gap-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-yellow-800 font-semibold mb-2">
                  Gedeeltelijk geüpload ({uniqueFiles.length} van {uploadedFiles.length} documenten):
                </div>
                <div className="text-yellow-700 text-sm">
                  {uniqueFiles.map((fileName, index) => (
                    <div key={index} className="ml-2">
                      • {fileName}
                    </div>
                  ))}
                </div>
                <div className="text-red-600 text-xs mt-2">
                  {failedUploads.length} upload(s) mislukt. Kijk in de notificaties voor details.
                </div>
              </div>
              <UploadBttn onClick={handleUploadClick} text='Meer documenten uploaden' />
            </div>
          );
        }
        return <UploadBttn onClick={handleUploadClick} text='Probeer opnieuw te uploaden'/>

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full min-h-[calc(100dvh-220px)] lg:min-h-0 flex flex-col gap-6 lg:gap-[50px] px-[25px] py-3 pb-4 lg:px-[97px] lg:py-[143px] overflow-scroll scrollbar-hide">
      <section className="flex flex-col gap-[52px]">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleDocumentUpload}
          multiple
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
        />

        {renderUploadSection()}

        {/* Display all chat history */}
        {chatHistory.map((message, index) => (
          <div key={index} className="flex flex-col gap-6 lg:gap-[52px]">
            {/* Question */}
            <div className="w-fit h-[61px] bg-[#F9FBFA] rounded-lg flex justify-between items-start px-4 gap-11">
              <p className="w-fit h-6 m-auto text-[#342222] text-[16px] leading-6 font-normal font-Montserrat">
                {message.question}
              </p>
            </div>

            {/* Answer */}
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

            {/* Documents */}
            {Array.isArray(message.documents) && message.documents.length > 0 && (
              <section className="w-full">
                <PdfSnippetList documents={message.documents} />
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
            {loadingCardVisible && (
              <div className="w-[29px] h-[29px] m-auto border-4 border-t-[#23BD92] border-[#F9FBFA] rounded-full animate-spin" />
            )}
          </div>
        )}
        
        {error && (
          <div className="text-red-600 text-[16px] font-medium">
            {error.message || 'Er is een fout opgetreden.'}
          </div>
        )}

        {/* Always show the input at the bottom */}
        <AutoGrowingTextarea onSubmit={handleQuestionSubmit} loading={apiLoading || loadingCardVisible} />
      </section>

      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </div>
  );
}
