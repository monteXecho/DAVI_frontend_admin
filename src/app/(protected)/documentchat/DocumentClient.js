'use client';

import { useRef, useState } from 'react';
import AutoGrowingTextarea from '@/components/AutoGrowingTextarea';
import PdfSnippetList from '@/components/PdfSnippetList';
import { useApi } from '@/lib/useApi';
import UploadBttn from '@/components/buttons/UploadBttn';
import UploadingBttn from '@/components/buttons/UploadingBttn';
import SuccessBttn from '@/components/buttons/SuccessBttn';
import { ToastContainer, toast } from 'react-toastify';
     
const UploadStates = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function DocumentClient() {
  const { askQuestion, uploadDocument, loading: apiLoading, error } = useApi();

  const [response, setResponse] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(UploadStates.IDLE);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [successfulUploads, setSuccessfulUploads] = useState([]);
  const [failedUploads, setFailedUploads] = useState([]);
  const [loadingCardVisible, setLoadingCardVisible] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState('');

  const fileInputRef = useRef(null);

  const handleQuestionSubmit = async (questionText) => {
    if (!questionText.trim()) return;

    setResponse('');
    setDocuments([]);
    setSubmittedQuestion(questionText);
    setLoadingCardVisible(true);

    try {
      const data = await askQuestion(questionText);
      setResponse(data.answer || '');
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to fetch answer:', err);
      setResponse('Er is een fout opgetreden bij het ophalen van het antwoord.');
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
    <div className="w-full h-full flex flex-col gap-[50px] lg:py-[143px] lg:px-[97px] px-[25px] py-[22px] overflow-scroll scrollbar-hide">
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

        {submittedQuestion && (
          <div className="w-fit h-[61px] bg-[#F9FBFA] rounded-lg flex justify-between items-start px-4 gap-11">
            <p className="w-fit h-[24px] m-auto text-[#342222] text-[16px] leading-[24px] font-normal font-Montserrat">
              {submittedQuestion}
            </p>
            {loadingCardVisible && (
              <div className="w-[29px] h-[29px] m-auto border-4 border-t-[#23BD92] border-[#F9FBFA] rounded-full animate-spin" />
            )}
          </div>
        )}

        {response && (
          <div className="w-full font-montserrat font-normal text-[16px] whitespace-pre-wrap leading-normal">
            {response}
          </div>
        )}

        {Array.isArray(documents) && documents.length > 0 && (
          <section className="w-full">
            <PdfSnippetList documents={documents} />
          </section>
        )}
        
        {error && (
          <div className="text-red-600 text-[16px] font-medium">
            {error.message || 'Er is een fout opgetreden.'}
          </div>
        )}

        {!loadingCardVisible && submittedQuestion && (
          <AutoGrowingTextarea onSubmit={handleQuestionSubmit} loading={apiLoading} />
        )}

        {!submittedQuestion && !loadingCardVisible && (
          <AutoGrowingTextarea onSubmit={handleQuestionSubmit} loading={apiLoading} />
        )}
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
