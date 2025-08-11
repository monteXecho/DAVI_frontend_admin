'use client';

import { useRef, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import AutoGrowingTextarea from '@/components/AutoGrowingTextarea';
import ProtectedLayout from '@/components/ProtectedLayout';
import PdfSnippetList from '@/components/PdfSnippetList';
import { useApi } from '@/lib/useApi';
import UploadBttn from '@/components/buttons/UploadBttn';
import UploadingBttn from '@/components/buttons/UploadingBttn';
import SuccessBttn from '@/components/buttons/SuccessBttn';

const UploadStates = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
};

export default function DocumentClient() {
  const { keycloak } = useKeycloak();
  const isAdmin =
    keycloak?.authenticated &&
    keycloak?.tokenParsed?.realm_access?.roles?.includes('admin');

  const { askQuestion, uploadDocument, loading: apiLoading, error } = useApi();

  const [response, setResponse] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(UploadStates.IDLE);
  const [uploadedFileName, setUploadedFileName] = useState('');
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
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadStatus(UploadStates.UPLOADING);

    const formData = new FormData();
    formData.append('file', file);

    const { success, data } = await uploadDocument(formData, 'document');
    if (success) {
      setUploadStatus(UploadStates.SUCCESS);
    } else {
      setUploadStatus(UploadStates.IDLE);
      setUploadedFileName('');
    }
  };

  const renderUploadSection = () => {
    if (!isAdmin) return null;

    switch (uploadStatus) {
      case UploadStates.IDLE:
        return <UploadBttn onClick={handleUploadClick} text='Upload document' />

      case UploadStates.UPLOADING:
        return <UploadingBttn text={uploadedFileName} />

      case UploadStates.SUCCESS:
        return (
          <>
            <SuccessBttn text={uploadedFileName} /> 
            <UploadBttn onClick={handleUploadClick} text='Upload document' />
          </>
        )

      default:
        return null;
    }
  };

  return (
    <ProtectedLayout>
      <div className="w-full h-full flex flex-col gap-[50px] lg:py-[143px] lg:px-[97px] px-[25px] py-[22px] overflow-scroll scrollbar-hide">
        <section className="flex flex-col gap-[31px]">
          <h1 className="text-[#342222] font-montserrat font-extrabold text-3xl leading-none">
            Documenten Robin!
          </h1>
          <p className="text-black font-montserrat font-normal text-sm leading-6">
            Hallo Robin! Hier vind je alle bedrijfs- en algemene documenten.
            <br />
            Je kunt direct een vraag stellen, of een eigen document uploaden voor analyse.
          </p>
        </section>

        <section className="flex flex-col gap-[52px]">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleDocumentUpload}
          />

          {renderUploadSection()}

          {/* Question + Spinner */}
          {submittedQuestion && (
            <div className="w-fit h-[61px] bg-[#F9FBFA] rounded-[8px] flex justify-between items-start px-4 gap-11">
              <p className="w-fit h-[24px] m-auto text-[#342222] text-[16px] leading-[24px] font-normal font-Montserrat">
                {submittedQuestion}
              </p>
              {loadingCardVisible && (
                <div className="w-[29px] h-[29px] m-auto border-4 border-t-[#23BD92] border-[#F9FBFA] rounded-full animate-spin" />
              )}
            </div>
          )}

          {/* Response text */}
          {response && (
            <div className="w-full font-montserrat font-normal text-sm whitespace-pre-wrap leading-normal">
              {response}
            </div>
          )}

          {Array.isArray(documents) && documents.length > 0 && (
            <section className="w-full">
              <PdfSnippetList documents={documents} />
            </section>
          )}
          
          {/* Error */}
          {error && (
            <div className="text-red-600 text-sm font-medium">
              {error.message || 'Er is een fout opgetreden.'}
            </div>
          )}

          {/* Input reappears after loading */}
          {!loadingCardVisible && submittedQuestion && (
            <AutoGrowingTextarea onSubmit={handleQuestionSubmit} loading={apiLoading} />
          )}

          {/* Initial state input */}
          {!submittedQuestion && !loadingCardVisible && (
            <AutoGrowingTextarea onSubmit={handleQuestionSubmit} loading={apiLoading} />
          )}
        </section>

      </div>
    </ProtectedLayout>
  );
}
