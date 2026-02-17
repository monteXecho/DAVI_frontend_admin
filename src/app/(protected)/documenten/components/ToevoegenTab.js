'use client'

import { useRef, useEffect, useState } from "react"
import DropdownMenu from "@/components/input/DropdownMenu"
import UploadBttn from '@/components/buttons/UploadBttn'
import UploadingBttn from '@/components/buttons/UploadingBttn'
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import SuccessBttn from "@/components/buttons/SuccessBttn"
import IssueBttn from "@/components/buttons/IssueBttn"
import { ToastContainer, toast } from 'react-toastify';

const UploadStates = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
}

export default function ToevoegenTab({ folders = [], onUploadDocument, onAddFolders, canWrite = true }) {
  const [selectedFolder, setSelectedFolder] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState([]) 
  const [uploadStatus, setUploadStatus] = useState(UploadStates.IDLE)
  const [successfulUploads, setSuccessfulUploads] = useState([])
  const [failedUploads, setFailedUploads] = useState([])
  
  const [uploadTargets, setUploadTargets] = useState([])
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0) 
  const [uploadMode, setUploadMode] = useState('files') 
  const [selectedFolderName, setSelectedFolderName] = useState("")
  const [showFolderSelection, setShowFolderSelection] = useState(false)

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

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
    
    const remainingFolders = folders.filter(folder => 
      !uploadTargets.some(target => target.folder === folder) && folder !== selectedFolder
    )
    
    if (remainingFolders.length > 0) {
      setSelectedFolder(remainingFolders[0])
    } else {
      setSelectedFolder("") 
    }
  }

  const handleRemoveUploadTarget = (index) => {
    const removedFolder = uploadTargets[index].folder
    setUploadTargets(prev => prev.filter((_, i) => i !== index))
    
    if (!selectedFolder && folders.includes(removedFolder)) {
      setSelectedFolder(removedFolder)
    }
  }

  const handleUploadClick = () => {
    if (!canWrite) return
    
    // Show folder selection if not already shown
    if (!showFolderSelection) {
      setShowFolderSelection(true)
      return
    }
    
    // If folder selection is shown, check if we have targets
    if (uploadTargets.length === 0) {
      toast.warn("Voeg minimaal één map toe voordat u uploadt.")
      return
    }
    setUploadMode('files')
    fileInputRef.current?.click()
  }

  const handleFolderUploadClick = () => {
    if (!canWrite) return
    setUploadMode('folder')
    folderInputRef.current?.click()
  }

  const handleDocumentUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (uploadTargets.length === 0) {
      toast.warn("Voeg minimaal één map toe.")
      return
    }

    setUploadedFiles(files)
    setUploadStatus(UploadStates.UPLOADING)
    setSuccessfulUploads([])
    setFailedUploads([])
    setCurrentFileIndex(0)
    setCurrentUploadIndex(0)

    await uploadAllFiles(files)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFolderUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const firstFile = files[0]
    let folderName = ""
    
    if (firstFile.webkitRelativePath) {
      const pathParts = firstFile.webkitRelativePath.split('/').filter(p => p.trim())
      
      if (pathParts.length > 0) {
        folderName = pathParts[0].trim()
        
        folderName = folderName.replace(/[/\\]/g, '').trim()
        
        const uniqueParts = [...new Set(folderName.split(/[/\\]/).filter(p => p.trim()))]
        if (uniqueParts.length > 0) {
          folderName = uniqueParts[0] 
        }
      }
    } else {
      folderName = `Nieuwe map ${new Date().toLocaleDateString()}`
    }

    if (!folderName) {
      toast.error("Kon mapnaam niet bepalen. Probeer opnieuw.")
      return
    }
    
    folderName = folderName.replace(/[/\\]/g, '').trim()

    setSelectedFolderName(folderName)
    setUploadedFiles(files)
    setUploadStatus(UploadStates.UPLOADING)
    setSuccessfulUploads([])
    setFailedUploads([])
    setCurrentFileIndex(0)

    try {
      if (onAddFolders) {
        const folderResult = await onAddFolders([folderName])
        
        if (!folderResult?.success) {
          const errorMsg = folderResult?.message || 'Kon map niet aanmaken'
          toast.error(errorMsg)
          setUploadStatus(UploadStates.ERROR)
          
          if (folderInputRef.current) {
            folderInputRef.current.value = ''
          }
          return
        }

        if (folderResult.duplicated_folders && folderResult.duplicated_folders.includes(folderName)) {
          toast.warn(`Map "${folderName}" bestaat al. Documenten worden toegevoegd aan bestaande map.`)
        } else {
          toast.success(`Map "${folderName}" is aangemaakt.`)
        }
      }

      await uploadAllFiles(files, folderName)
      
      if (folderInputRef.current) {
        folderInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Folder upload error:', err)
      toast.error(`Fout bij uploaden van map: ${err.message || 'Onbekende fout'}`)
      setUploadStatus(UploadStates.ERROR)
      
      if (folderInputRef.current) {
        folderInputRef.current.value = ''
      }
    }
  }

  const uploadAllFiles = async (files, targetFolderName = null) => {
    const successful = []
    const failed = []
    
    const targets = targetFolderName 
      ? [{ folder: targetFolderName }]
      : uploadTargets

    if (targets.length === 0) {
      toast.warn("Geen doelmap geselecteerd.")
      setUploadStatus(UploadStates.ERROR)
      return
    }
    
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      setCurrentFileIndex(fileIndex)
      const file = files[fileIndex]
      
      for (let targetIndex = 0; targetIndex < targets.length; targetIndex++) {
        setCurrentUploadIndex(targetIndex)
        const target = targets[targetIndex]
        
        let cleanFolderName = target.folder.trim()
        cleanFolderName = cleanFolderName.replace(/[/\\]/g, '')
        const parts = cleanFolderName.split(/[/\\]/).filter(p => p.trim())
        if (parts.length > 0) {
          cleanFolderName = parts[parts.length - 1] 
        }
        
        const formData = new FormData()
        formData.append('file', file)

        try {
          const result = await onUploadDocument(cleanFolderName, formData)

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

    setSuccessfulUploads(successful)
    setFailedUploads(failed)
    
    if (failed.length === 0 && successful.length > 0) {
      setUploadStatus(UploadStates.SUCCESS)
      if (targetFolderName) {
        toast.success(`Alle documenten zijn geüpload naar map "${targetFolderName}"`)
      }
      // Reset folder selection after successful upload
      setShowFolderSelection(false)
      setUploadTargets([])
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
        return null // Cards are shown in main render instead
      case UploadStates.UPLOADING:
        const currentFile = uploadedFiles[currentFileIndex]
        const totalFiles = uploadedFiles.length
        
        let progressText = ""
        if (uploadMode === 'folder' && selectedFolderName) {
          progressText = `Map "${selectedFolderName}" - Bestand ${currentFileIndex + 1}/${totalFiles}: ${currentFile.name}`
        } else if (totalFiles > 1) {
          progressText = `Bestand ${currentFileIndex + 1}/${totalFiles}: ${currentFile.name} - `
          if (uploadTargets.length > 1) {
            progressText += `Bezig met uploaden naar ${currentUploadIndex + 1}/${uploadTargets.length}: ${uploadTargets[currentUploadIndex].folder}`
          } else {
            progressText += `Bezig met uploaden naar ${uploadTargets[0].folder}`
          }
        } else {
          progressText = `${currentFile.name} - `
          if (uploadTargets.length > 1) {
            progressText += `Bezig met uploaden naar ${currentUploadIndex + 1}/${uploadTargets.length}: ${uploadTargets[currentUploadIndex].folder}`
          } else {
            progressText += `Bezig met uploaden naar ${uploadTargets[0].folder}`
          }
        }
        
        return <UploadingBttn text={progressText} />
      case UploadStates.SUCCESS:
        if (successfulUploads.length === 0) return null
        
        const uniqueFiles = [...new Set(successfulUploads.map(u => u.file))]
        const isFolderUpload = uploadMode === 'folder' && selectedFolderName
        
        return (
          <div className="flex flex-col w-fit gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800 font-semibold mb-2">
                {isFolderUpload 
                  ? `Map "${selectedFolderName}" aangemaakt en ${uniqueFiles.length} documenten geüpload:`
                  : `Successvol geüpload (${uniqueFiles.length} documenten):`
                }
              </div>
              <div className="text-green-700 text-sm max-h-40 overflow-y-auto">
                {uniqueFiles.map((fileName, index) => (
                  <div key={index} className="ml-2">
                    • {fileName}
                  </div>
                ))}
              </div>
              {isFolderUpload ? (
                <div className="text-green-600 text-xs mt-2">
                  Alle documenten zijn toegevoegd aan map &quot;{selectedFolderName}&quot;
                </div>
              ) : uploadTargets.length > 1 && (
                <div className="text-green-600 text-xs mt-2">
                  Naar {uploadTargets.length} mappen geüpload
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFolderSelection(true)
                  setUploadStatus(UploadStates.IDLE)
                  setSuccessfulUploads([])
                  setFailedUploads([])
                }}
                className="w-fit h-10 bg-[#23BD92] rounded-lg flex items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[18px] text-white hover:bg-[#1ea87c] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.479 7.092C19.267 3.141 16.006 0 12 0C7.995 0 4.733 3.141 4.521 7.092C1.951 7.555 0 9.798 0 12.5C0 15.537 2.463 18 5.5 18H18.5C21.537 18 24 15.537 24 12.5C24 9.798 22.049 7.555 19.479 7.092ZM12 6L16 10H13V14H11V10H8L12 6Z" fill="white"/>
                </svg>
                <span>Meer documenten uploaden</span>
              </button>
              <button
                onClick={handleFolderUploadClick}
                className="w-fit h-10 bg-[#23BD92] rounded-lg flex items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[18px] text-white hover:bg-[#1ea87c] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.479 7.092C19.267 3.141 16.006 0 12 0C7.995 0 4.733 3.141 4.521 7.092C1.951 7.555 0 9.798 0 12.5C0 15.537 2.463 18 5.5 18H18.5C21.537 18 24 15.537 24 12.5C24 9.798 22.049 7.555 19.479 7.092ZM12 6L16 10H13V14H11V10H8L12 6Z" fill="white"/>
                </svg>
                <span>Nog een map uploaden</span>
              </button>
            </div>
          </div>
        )
      case UploadStates.ERROR:
        if (successfulUploads.length > 0) {
          const uniqueFiles = [...new Set(successfulUploads.map(u => u.file))]
          return (
            <div className="flex flex-col w-2/3 gap-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-yellow-800 font-semibold mb-2">
                  {uploadMode === 'folder' && selectedFolderName
                    ? `Map "${selectedFolderName}" - Gedeeltelijk geüpload (${uniqueFiles.length} van ${uploadedFiles.length} documenten):`
                    : `Gedeeltelijk geüpload (${uniqueFiles.length} van ${uploadedFiles.length} documenten):`
                  }
                </div>
                <div className="text-yellow-700 text-sm max-h-40 overflow-y-auto">
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
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFolderSelection(true)
                    setUploadStatus(UploadStates.IDLE)
                    setSuccessfulUploads([])
                    setFailedUploads([])
                  }}
                  className="w-fit h-10 bg-[#23BD92] rounded-lg flex items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[18px] text-white hover:bg-[#1ea87c] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.479 7.092C19.267 3.141 16.006 0 12 0C7.995 0 4.733 3.141 4.521 7.092C1.951 7.555 0 9.798 0 12.5C0 15.537 2.463 18 5.5 18H18.5C21.537 18 24 15.537 24 12.5C24 9.798 22.049 7.555 19.479 7.092ZM12 6L16 10H13V14H11V10H8L12 6Z" fill="white"/>
                  </svg>
                  <span>Meer documenten uploaden</span>
                </button>
                <button
                  onClick={handleFolderUploadClick}
                  className="w-fit h-10 bg-[#23BD92] rounded-lg flex items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[18px] text-white hover:bg-[#1ea87c] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.479 7.092C19.267 3.141 16.006 0 12 0C7.995 0 4.733 3.141 4.521 7.092C1.951 7.555 0 9.798 0 12.5C0 15.537 2.463 18 5.5 18H18.5C21.537 18 24 15.537 24 12.5C24 9.798 22.049 7.555 19.479 7.092ZM12 6L16 10H13V14H11V10H8L12 6Z" fill="white"/>
                  </svg>
                  <span>Nog een map uploaden</span>
                </button>
              </div>
            </div>
          )
        }
        return (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowFolderSelection(true)
                setUploadStatus(UploadStates.IDLE)
                setSuccessfulUploads([])
                setFailedUploads([])
              }}
              className="w-fit h-10 bg-[#23BD92] rounded-lg flex items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[18px] text-white hover:bg-[#1ea87c] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.479 7.092C19.267 3.141 16.006 0 12 0C7.995 0 4.733 3.141 4.521 7.092C1.951 7.555 0 9.798 0 12.5C0 15.537 2.463 18 5.5 18H18.5C21.537 18 24 15.537 24 12.5C24 9.798 22.049 7.555 19.479 7.092ZM12 6L16 10H13V14H11V10H8L12 6Z" fill="white"/>
              </svg>
              <span>Probeer opnieuw te uploaden</span>
            </button>
            <button
              onClick={handleFolderUploadClick}
              className="w-fit h-10 bg-[#23BD92] rounded-lg flex items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[18px] text-white hover:bg-[#1ea87c] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.479 7.092C19.267 3.141 16.006 0 12 0C7.995 0 4.733 3.141 4.521 7.092C1.951 7.555 0 9.798 0 12.5C0 15.537 2.463 18 5.5 18H18.5C21.537 18 24 15.537 24 12.5C24 9.798 22.049 7.555 19.479 7.092ZM12 6L16 10H13V14H11V10H8L12 6Z" fill="white"/>
              </svg>
              <span>Of upload een map</span>
            </button>
          </div>
        )
      default:
        return null
    }
  }

  const getAvailableFolders = () => {
    return folders.filter(folder => 
      !uploadTargets.some(target => target.folder === folder)
    )
  }

  const availableFolders = getAvailableFolders()
  const isFirstFolderSelected = selectedFolder === folders[0] && uploadTargets.length === 0

  return (
    <div className="flex flex-col w-full gap-11">
      {!canWrite && (
        <div className="text-gray-500 text-sm italic py-4">
          Alleen-lezen modus: U heeft geen schrijfrechten om documenten toe te voegen.
        </div>
      )}
      
      {canWrite && (
        <>
          {/* Action Cards Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Documenten Card */}
            <div 
              onClick={handleUploadClick}
              className={`
                group relative flex flex-col rounded-2xl border-2 transition-all duration-200 cursor-pointer
                ${uploadStatus === UploadStates.UPLOADING
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' 
                  : 'border-[#23BD92]/20 bg-white hover:border-[#23BD92]/40 hover:shadow-lg hover:-translate-y-0.5'
                }
              `}
            >
              <div className="p-6 flex flex-col gap-4">
                {/* Icon and Title Section */}
                <div className="flex items-start gap-4">
                  <div className={`
                    flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-colors
                    ${uploadStatus === UploadStates.UPLOADING
                      ? 'bg-gray-100' 
                      : 'bg-gradient-to-br from-[#23BD92] to-[#1ea87c] group-hover:from-[#1ea87c] group-hover:to-[#23BD92]'
                    }
                  `}>
                    <svg 
                      width="24" 
                      height="24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className={uploadStatus === UploadStates.UPLOADING ? 'text-gray-400' : 'text-white'}
                    >
                      <path 
                        d="M19.479 7.092C19.267 3.141 16.006 0 12 0C7.995 0 4.733 3.141 4.521 7.092C1.951 7.555 0 9.798 0 12.5C0 15.537 2.463 18 5.5 18H18.5C21.537 18 24 15.537 24 12.5C24 9.798 22.049 7.555 19.479 7.092ZM12 6L16 10H13V14H11V10H8L12 6Z" 
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-montserrat font-bold text-lg leading-tight mb-2
                      ${uploadStatus === UploadStates.UPLOADING ? 'text-gray-500' : 'text-gray-900'}
                    `}>
                      Upload Documenten
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Upload een document van je PC. Je kunt meerdere documenten selecteren door de Ctrl-toets in te drukken.
                    </p>
                  </div>
                </div>
                
                {/* Action Indicator */}
                <div className="mt-2 flex items-center text-sm font-medium text-[#23BD92] group-hover:text-[#1ea87c] transition-colors">
                  <span>Klik om te beginnen</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Upload Map met Documenten Card */}
            <div 
              onClick={handleFolderUploadClick}
              className={`
                group relative flex flex-col rounded-2xl border-2 transition-all duration-200 cursor-pointer
                ${uploadStatus === UploadStates.UPLOADING
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' 
                  : 'border-[#23BD92]/20 bg-white hover:border-[#23BD92]/40 hover:shadow-lg hover:-translate-y-0.5'
                }
              `}
            >
              <div className="p-6 flex flex-col gap-4">
                {/* Icon and Title Section */}
                <div className="flex items-start gap-4">
                  <div className={`
                    flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-colors
                    ${uploadStatus === UploadStates.UPLOADING
                      ? 'bg-gray-100' 
                      : 'bg-gradient-to-br from-[#23BD92] to-[#1ea87c] group-hover:from-[#1ea87c] group-hover:to-[#23BD92]'
                    }
                  `}>
                    <svg 
                      width="24" 
                      height="24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className={uploadStatus === UploadStates.UPLOADING ? 'text-gray-400' : 'text-white'}
                    >
                      <path 
                        d="M19.479 7.092C19.267 3.141 16.006 0 12 0C7.995 0 4.733 3.141 4.521 7.092C1.951 7.555 0 9.798 0 12.5C0 15.537 2.463 18 5.5 18H18.5C21.537 18 24 15.537 24 12.5C24 9.798 22.049 7.555 19.479 7.092ZM12 6L16 10H13V14H11V10H8L12 6Z" 
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-montserrat font-bold text-lg leading-tight mb-2
                      ${uploadStatus === UploadStates.UPLOADING ? 'text-gray-500' : 'text-gray-900'}
                    `}>
                      Upload map met documenten
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      De bestaande mapnaam en documenten worden overgenomen.
                    </p>
                  </div>
                </div>
                
                {/* Action Indicator */}
                <div className="mt-2 flex items-center text-sm font-medium text-[#23BD92] group-hover:text-[#1ea87c] transition-colors">
                  <span>Klik om te uploaden</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Folder Selection Section - Shown when Upload Documenten is clicked */}
          {showFolderSelection && (
            <div className="flex flex-col w-full gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex flex-col w-full">
                <span className="mb-2 font-montserrat text-[16px] font-semibold text-gray-900">
                  Selecteer een map en klik op &apos;+&apos;
                </span>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DropdownMenu
                      value={selectedFolder}
                      onChange={setSelectedFolder}
                      allOptions={availableFolders}
                      disabled={!canWrite || availableFolders.length === 0}
                      placeholder="Selecteer een map..."
                    />
                  </div>
                  {canWrite && (
                    <button
                      onClick={handleAddUploadTarget}
                      title="Voeg map toe"
                      className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedFolder || availableFolders.length === 0}
                    >
                      <AddIcon />
                    </button>
                  )}
                </div>
                
                {folders.length === 0 ? (
                  <p className="text-sm text-gray-500 mt-2">
                    Geen mappen beschikbaar. Voeg eerst mappen toe in het &quot;Mappen&quot; tabblad.
                  </p>
                ) : availableFolders.length === 0 ? (
                  <p className="text-sm text-gray-500 mt-2">
                    Alle mappen zijn al geselecteerd.
                  </p>
                ) : null}
              </div>

              {/* Display selected upload targets */}
              {uploadTargets.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  <span className="font-montserrat text-[16px] font-semibold text-gray-900">Toevoegen aan:</span>
                  <div className="flex flex-wrap gap-2">
                    {uploadTargets.map((target, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <SuccessBttn text={target.folder} />
                        {canWrite && (
                          <button
                            onClick={() => handleRemoveUploadTarget(index)}
                            title="Verwijder"
                            className="hover:opacity-80 transition-opacity"
                          >
                            <RedCancelIcon />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {uploadTargets.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadStatus === UploadStates.UPLOADING}
                    className={`
                      w-fit h-12 px-6 rounded-lg font-montserrat font-bold text-base text-white transition-all
                      ${uploadStatus === UploadStates.UPLOADING
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#23BD92] hover:bg-[#1ea87c] shadow-sm hover:shadow-md'
                      }
                    `}
                  >
                    {uploadStatus === UploadStates.UPLOADING ? 'Uploaden...' : 'Upload documenten'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Upload Status Section */}
          {uploadStatus !== UploadStates.IDLE && (
            <div className="flex flex-col w-full gap-4">
              {renderUploadSection()}
            </div>
          )}
        </>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleDocumentUpload}
        multiple
        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
      />

      <input
        type="file"
        ref={folderInputRef}
        className="hidden"
        onChange={handleFolderUpload}
        webkitdirectory=""
        directory=""
        multiple
      />
      
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  )
}