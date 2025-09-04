'use client';

import { useRef, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useApi } from '@/lib/useApi';
import UploadSuccessState from '@/components/UploadSuccessState';
import UploadingBttn from '@/components/buttons/UploadingBttn';
import UploadBttn from '@/components/buttons/UploadBttn';
import UploadIssueState from '@/components/UploadIssueState';

const UploadStates = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ISSUE: 'issue',
};

const STORAGE_KEY_HISTORY_BKR = 'uploadHistory_BKRClient';

const getStoredHistory = () => {
  const storedHistory = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY_BKR)) || [];
  return storedHistory;
};

const saveHistoryToLocalStorage = (history) => {
  localStorage.setItem(STORAGE_KEY_HISTORY_BKR, JSON.stringify(history));
};

export default function BKRtClient() {
  const { keycloak } = useKeycloak();
  const { uploadDocument } = useApi();
  const fileInputRef = useRef(null);

  const isAdmin =
    keycloak?.authenticated &&
    keycloak?.tokenParsed?.realm_access?.roles?.includes('admin');

  const initialHistory = getStoredHistory();

  const [uploadStatus, setUploadStatus] = useState(UploadStates.IDLE);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadHistory, setUploadHistory] = useState(initialHistory);

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

    const newHistory = [
      ...uploadHistory,
      { fileName: file.name, status: UploadStates.UPLOADING, timestamp: new Date().toISOString() },
    ];
    setUploadHistory(newHistory);
    saveHistoryToLocalStorage(newHistory); 

    const { success, data } = await uploadDocument(formData, 'bkr');
    if (success) {
      let newStatus = UploadStates.SUCCESS;
      if (!data.success) {
        newStatus = UploadStates.ISSUE;
      }

      const updatedHistory = newHistory.map((doc) =>
        doc.fileName === file.name ? { ...doc, status: newStatus } : doc
      );

      setUploadHistory(updatedHistory); 
      saveHistoryToLocalStorage(updatedHistory); 

      setUploadStatus(newStatus);
    } else {
      const updatedHistory = newHistory.map((doc) =>
        doc.fileName === file.name ? { ...doc, status: UploadStates.ISSUE } : doc
      );
      setUploadHistory(updatedHistory);
      saveHistoryToLocalStorage(updatedHistory);
      setUploadStatus(UploadStates.IDLE); 
      setUploadedFileName('');
    }
  };

  return (
    <ProtectedLayout>
      <div className="w-full h-full flex flex-col px-[27px] py-9 lg:py-[143px] lg:px-[97px] overflow-scroll scrollbar-hide">
        <section className="flex flex-col gap-[31px]">
          <h1 className="text-[#342222] font-montserrat font-extrabold text-3xl leading-[39px]">
            BeroepsKracht-Kindratio
          </h1>
          <p className="text-black font-montserrat font-normal text-lg leading-6">
            Upload hier je document en verifieer of de BKR-regeling correct is toegepast.
          </p>
        </section>

        <section className="flex flex-col gap-[52px]">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleDocumentUpload}
          />

          <div className="">
            {uploadHistory.map((file, index) => {
              switch (file.status) {
                case UploadStates.SUCCESS:
                  return <UploadSuccessState key={index} uploadedFileName={file.fileName} />;
                case UploadStates.ISSUE:
                  return <UploadIssueState key={index} uploadedFileName={file.fileName} />;
                case UploadStates.UPLOADING:
                  return <UploadingBttn key={index} uploadedFileName={file.fileName} />;
                case UploadStates.IDLE:
                  return null;
                default:
                  return null;git
              }
            })}
          </div>

          {!uploadStatus.UPLOADING 
            ?  <UploadBttn onClick={handleUploadClick} text='Upload BKR document' />
            : <></>
          }
        </section>
      </div>
    </ProtectedLayout>
  );
}
