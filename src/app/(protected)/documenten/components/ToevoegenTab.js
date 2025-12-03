'use client'

import { useRef, useEffect, useState } from "react"
import DropdownMenu from "@/components/input/DropdownMenu"
import UploadBttn from '@/components/buttons/UploadBttn'
import UploadingBttn from '@/components/buttons/UploadingBttn'
import SuccessBttn from '@/components/buttons/SuccessBttn'
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import { ToastContainer, toast } from 'react-toastify';

const UploadStates = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
}

export default function ToevoegenTab({ folders = [], onUploadDocument }) {
  const [selectedFolder, setSelectedFolder] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState([]) 
  const [uploadStatus, setUploadStatus] = useState(UploadStates.IDLE)
  const [successfulUploads, setSuccessfulUploads] = useState([])
  const [failedUploads, setFailedUploads] = useState([])
  
  const [uploadTargets, setUploadTargets] = useState([])
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0) 

  const fileInputRef = useRef(null)

  // Auto-select first folder when folders array changes
  useEffect(() => {
    if (folders.length > 0 && selectedFolder === "") {
      setSelectedFolder(folders[0])
    }
  }, [folders, selectedFolder])

  const handleAddUploadTarget = () => {
    if (!selectedFolder) {
      toast.warn("Selecteer een map.")
      return
    }

    const targetExists = uploadTargets.some(target => target.folder === selectedFolder)

    if (targetExists) {
      toast.warn("Deze map is al toegevoegd.")
      return
    }

    setUploadTargets(prev => [...prev, { folder: selectedFolder }])
    
    // Auto-select next available folder after adding
    const remainingFolders = folders.filter(folder => 
      !uploadTargets.some(target => target.folder === folder) && folder !== selectedFolder
    )
    
    if (remainingFolders.length > 0) {
      setSelectedFolder(remainingFolders[0])
    } else {
      setSelectedFolder("") // No more folders available
    }
  }

  const handleRemoveUploadTarget = (index) => {
    const removedFolder = uploadTargets[index].folder
    setUploadTargets(prev => prev.filter((_, i) => i !== index))
    
    // If the removed folder is not in current selection and exists in folders array,
    // consider making it available in dropdown
    if (!selectedFolder && folders.includes(removedFolder)) {
      setSelectedFolder(removedFolder)
    }
  }

  const handleUploadClick = () => {
    if (uploadTargets.length === 0) {
      toast.warn("Voeg minimaal één map toe voordat u uploadt.")
      return
    }
    fileInputRef.current?.click()
  }

  const handleDocumentUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (uploadTargets.length === 0) {
      toast.warn("Voeg minimaal één map toe.")
      return
    }

    // Reset states
    setUploadedFiles(files)
    setUploadStatus(UploadStates.UPLOADING)
    setSuccessfulUploads([])
    setFailedUploads([])
    setCurrentFileIndex(0)
    setCurrentUploadIndex(0)

    await uploadAllFiles(files)
  }

  const uploadAllFiles = async (files) => {
    const successful = []
    const failed = []
    
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      setCurrentFileIndex(fileIndex)
      const file = files[fileIndex]
      
      for (let targetIndex = 0; targetIndex < uploadTargets.length; targetIndex++) {
        setCurrentUploadIndex(targetIndex)
        const target = uploadTargets[targetIndex]
        
        const formData = new FormData()
        formData.append('file', file)

        try {
          const result = await onUploadDocument(target.folder, formData)

          if (result?.success) {
            successful.push({
              file: file.name,
              folder: target.folder,
              result
            })
          } else {
            failed.push({
              file: file.name,
              folder: target.folder,
              error: result?.message || 'Onbekende fout'
            })
            toast.warn(`Upload mislukt voor ${file.name} naar ${target.folder}: ${result?.message || 'Onbekende fout'}`)
          }
        } catch (err) {
          console.error(`Upload error for ${file.name} to ${target.folder}:`, err)
          failed.push({
            file: file.name,
            folder: target.folder,
            error: err.message || 'Upload mislukt'
          })
          toast.warn(`Upload van ${file.name} naar ${target.folder} is mislukt`)
        }
      }
    }

    // Update states
    setSuccessfulUploads(successful)
    setFailedUploads(failed)
    
    // Determine final status
    if (failed.length === 0 && successful.length > 0) {
      setUploadStatus(UploadStates.SUCCESS)
    } else if (successful.length > 0) {
      setUploadStatus(UploadStates.ERROR)
      toast.error("Sommige uploads zijn mislukt. Kijk in de notificaties voor details.")
    } else {
      setUploadStatus(UploadStates.ERROR)
      toast.error("Alle uploads zijn mislukt.")
    }
  }

  const renderUploadSection = () => {
    switch (uploadStatus) {
      case UploadStates.IDLE:
        return <UploadBttn onClick={handleUploadClick} text="Upload documenten"/>
      case UploadStates.UPLOADING:
        const currentFile = uploadedFiles[currentFileIndex]
        const totalFiles = uploadedFiles.length
        
        let progressText = ""
        if (totalFiles > 1) {
          progressText = `Bestand ${currentFileIndex + 1}/${totalFiles}: ${currentFile.name} - `
        } else {
          progressText = `${currentFile.name} - `
        }
        
        if (uploadTargets.length > 1) {
          progressText += `Bezig met uploaden naar ${currentUploadIndex + 1}/${uploadTargets.length}: ${uploadTargets[currentUploadIndex].folder}`
        } else {
          progressText += `Bezig met uploaden naar ${uploadTargets[0].folder}`
        }
        
        return <UploadingBttn text={progressText} />
      case UploadStates.SUCCESS:
        // Only show success message when there are successful uploads
        if (successfulUploads.length === 0) return null
        
        const uniqueFiles = [...new Set(successfulUploads.map(u => u.file))]
        
        return (
          <div className="flex flex-col w-2/3 gap-4">
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
              {uploadTargets.length > 1 && (
                <div className="text-green-600 text-xs mt-2">
                  Naar {uploadTargets.length} mappen geüpload
                </div>
              )}
            </div>
            <UploadBttn onClick={handleUploadClick} text="Meer documenten uploaden" />
          </div>
        )
      case UploadStates.ERROR:
        // Show success button for successful uploads, but also indicate some failed
        if (successfulUploads.length > 0) {
          const uniqueFiles = [...new Set(successfulUploads.map(u => u.file))]
          return (
            <div className="flex flex-col w-2/3 gap-4">
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
              <UploadBttn onClick={handleUploadClick} text="Meer documenten uploaden" />
            </div>
          )
        }
        return <UploadBttn onClick={handleUploadClick} text="Probeer opnieuw te uploaden"/>
      default:
        return null
    }
  }

  // Get available folders for dropdown (exclude already selected ones)
  const getAvailableFolders = () => {
    return folders.filter(folder => 
      !uploadTargets.some(target => target.folder === folder)
    )
  }

  const availableFolders = getAvailableFolders()
  const isFirstFolderSelected = selectedFolder === folders[0] && uploadTargets.length === 0

  return (
    <div className="flex flex-col gap-11 w-full justify-between">
      <div className="flex w-full gap-5">
        <div className="flex flex-col w-full">
          <span className="mb-2 font-montserrat text-[16px]">Selecteer een map</span>
          <div className="flex gap-2">
            <div className="flex-1">
              <DropdownMenu
                value={selectedFolder}
                onChange={setSelectedFolder}
                allOptions={availableFolders}
                disabled={availableFolders.length === 0}
                placeholder="Selecteer een map..."
              />
            </div>
            <button
              onClick={handleAddUploadTarget}
              title="Voeg map toe"
              className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedFolder || availableFolders.length === 0}
            >
              <AddIcon />
            </button>
          </div>
          
          {folders.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">
              Geen mappen beschikbaar. Voeg eerst mappen toe in het "Mappen" tabblad.
            </p>
          ) : availableFolders.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">
              Alle mappen zijn al geselecteerd.
            </p>
          ) : null}
        </div>
      </div>

      {/* Display selected upload targets */}
      {uploadTargets.length > 0 && (
        <div className="flex flex-col w-2/3 gap-2">
          <span className="font-montserrat text-[16px]">Toevoegen aan:</span>
          <div className="flex flex-col gap-2 max-h-90 overflow-y-auto">
            {uploadTargets.map((target, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded">
                <span className="font-montserrat text-[14px]">
                  {target.folder}
                </span>
                <button
                  onClick={() => handleRemoveUploadTarget(index)}
                  title="Verwijder"
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <RedCancelIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleDocumentUpload}
        multiple
        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
      />

      <div className="flex flex-col w-2/3 gap-4">
        {renderUploadSection()}
      </div>
      
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  )
}