'use client'
import { useRef, useState } from "react"
import UploadBttn from '@/components/buttons/UploadBttn'
import UploadingBttn from '@/components/buttons/UploadingBttn'
import SuccessBttn from '@/components/buttons/SuccessBttn'

const UploadStates = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
}

export default function ReplaceDocumentsModal({ 
  documents = [], 
  uploadTargets = [],
  onClose, 
  onConfirm, 
  isMultiple = false 
}) {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadStatus, setUploadStatus] = useState(UploadStates.IDLE)
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploadedFiles(files)
    setUploadStatus(UploadStates.IDLE)
  }

  const handleConfirm = () => {
    if (uploadedFiles.length === 0) {
      alert("Selecteer eerst nieuwe bestanden om te uploaden.")
      return
    }
    onConfirm(uploadedFiles)
  }

  const renderUploadSection = () => {
    switch (uploadStatus) {
      case UploadStates.IDLE:
        return (
          <div className="flex flex-col gap-4">
            <UploadBttn onClick={handleUploadClick} text="Selecteer nieuwe bestanden"/>
            {uploadedFiles.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-800 font-semibold mb-2">
                  Geselecteerde bestanden:
                </div>
                <div className="text-blue-700 text-sm">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="ml-2">
                      • {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case UploadStates.UPLOADING:
        return <UploadingBttn text="Bezig met vervangen..." />
      case UploadStates.SUCCESS:
        return <SuccessBttn text="Vervanging voltooid" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {isMultiple ? "Documenten vervangen" : "Document vervangen"}
      </h2>
      
      {/* Documents to be replaced */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">
          Te vervangen {isMultiple ? "documenten" : "document"}:
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          {documents.map((doc, index) => (
            <div key={index} className="text-red-700 text-sm">
              • {doc.file} ({doc.role} / {doc.folder})
            </div>
          ))}
        </div>
      </div>

      {/* Upload targets */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">
          Nieuwe bestanden worden geüpload naar:
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          {uploadTargets.map((target, index) => (
            <div key={index} className="text-green-700 text-sm">
              • {target.role} / {target.folder}
            </div>
          ))}
        </div>
      </div>

      {/* File upload section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">
          Selecteer nieuwe bestanden:
        </h3>
        {renderUploadSection()}
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          multiple={isMultiple}
        />
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Annuleren
        </button>
        <button
          onClick={handleConfirm}
          disabled={uploadedFiles.length === 0}
          className="px-4 py-2 bg-[#23BD92] text-white rounded-lg hover:bg-[#1da67c] disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          Vervang document{isMultiple ? 'en' : ''}
        </button>
      </div>
    </div>
  )
}