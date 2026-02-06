'use client'

import { useState, useRef } from "react"
import { toast } from 'react-toastify'
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import SuccessBttn from "@/components/buttons/SuccessBttn"
import IssueBttn from "@/components/buttons/IssueBttn"
import UploadBttn from '@/components/buttons/UploadBttn'
import { useApi } from "@/lib/useApi"

export default function MakenTab({ onAddFolders, canWrite = true, onRefresh }) {
  const { uploadDocumentForRole } = useApi()
  
  const [folders, setFolders] = useState([""])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessages, setSuccessMessages] = useState([]) 
  const [issueMessages, setIssueMessages] = useState([]) 
  const [lastAddedFolders, setLastAddedFolders] = useState([])
  const [showFolderInputs, setShowFolderInputs] = useState(false)
  const [isUploadingFolder, setIsUploadingFolder] = useState(false)
  
  const folderInputRef = useRef(null)

  const addFolder = () => {
    setFolders(prev => [...prev, ""])
    setErrorMessage("")
    setSuccessMessages([])
    setIssueMessages([])
  }

  const removeFolder = (index) => {
    if (folders.length === 1) {
      setFolders([""])
    } else {
      setFolders(prev => prev.filter((_, i) => i !== index))
    }
    setErrorMessage("")
    setSuccessMessages([])
    setIssueMessages([])
  }

  const updateFolder = (index, value) => {
    setFolders(prev => prev.map((f, i) => i === index ? value : f))
    setErrorMessage("")
    setSuccessMessages([])
    setIssueMessages([])
  }

  const hasDuplicateInputs = () => {
    const nonEmptyFolders = folders
      .map(f => f.trim())
      .filter(Boolean)
      .map(f => f.replace(/^\/+|\/+$/g, "").toLowerCase())
    
    const uniqueFolders = new Set(nonEmptyFolders)
    return nonEmptyFolders.length !== uniqueFolders.size
  }

  const handleSave = async () => {
    setErrorMessage("")
    setSuccessMessages([])
    setIssueMessages([])

    if (hasDuplicateInputs()) {
      setErrorMessage("Er zijn mappen met dezelfde naam ingevoerd. Voer unieke mapnamen in.")
      return
    }

    const cleanFolders = folders
      .map(f => f.trim())
      .filter(Boolean)
      .map(f => f.replace(/^\/+|\/+$/g, ""))

    if (cleanFolders.length === 0) {
      setErrorMessage("Voer ten minste één mapnaam in.")
      return
    }

    try {
      setLoading(true)
      
      console.log('--- Sending folders to API --- :', cleanFolders)
      const res = await onAddFolders(cleanFolders)

      console.log('--- API Response --- : ', res)
      
      if (res.success) {
        if (res.duplicated_folders && res.duplicated_folders.length > 0) {
          const newIssueMessages = res.duplicated_folders.map((folderName, idx) => 
            <IssueBttn key={idx} text={`Map "${folderName}" bestaat al`} />
          )
          setIssueMessages(newIssueMessages)
          
          if (res.added_folders && res.added_folders.length > 0) {
            const newSuccessMessages = res.added_folders.map((folderName, idx) => 
              <SuccessBttn key={idx} text={`Map "${folderName}" toegevoegd`} />
            )
            setSuccessMessages(newSuccessMessages)
            
            const remainingFolders = folders.filter(folder => {
              const cleanName = folder.trim().replace(/^\/+|\/+$/g, "")
              return !res.added_folders.includes(cleanName)
            })
            setFolders(remainingFolders.length > 0 ? remainingFolders : [""])
            setLastAddedFolders(res.added_folders)
          } else {
            setLastAddedFolders([])
          }
        } else {
          const newSuccessMessages = (res.added_folders || []).map((folderName, idx) => 
            <SuccessBttn key={idx} text={`Map "${folderName}" toegevoegd`} />
          )
          setSuccessMessages(newSuccessMessages)
          
          setLastAddedFolders(res.added_folders || [])
          setFolders([""]) 
        }
        
        if (onRefresh) {
          await onRefresh()
        }
      } else {
        setErrorMessage(res.message || "Er is een fout opgetreden bij het opslaan van de mappen.")
      }
      
    } catch (err) {
      console.error('Error in handleSave:', err)
      
      if (err.response?.data) {
        const errorData = err.response.data
        if (errorData.duplicated_folders && errorData.duplicated_folders.length > 0) {
          const newIssueMessages = errorData.duplicated_folders.map((folderName, idx) => 
            <IssueBttn key={idx} text={`Map "${folderName}" bestaat al`} />
          )
          setIssueMessages(newIssueMessages)
        } else {
          setErrorMessage(errorData.message || "Er is een fout opgetreden bij het opslaan van de mappen.")
        }
      } else {
        setErrorMessage("Er is een fout opgetreden bij het opslaan van de mappen.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmptyFolder = () => {
    if (!canWrite) return
    setShowFolderInputs(true)
    setFolders([""])
    setErrorMessage("")
    setSuccessMessages([])
    setIssueMessages([])
  }

  const handleFolderUploadClick = () => {
    if (!canWrite) return
    folderInputRef.current?.click()
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
      if (folderInputRef.current) {
        folderInputRef.current.value = ''
      }
      return
    }
    
    folderName = folderName.replace(/[/\\]/g, '').trim()

    setIsUploadingFolder(true)
    setErrorMessage("")
    setSuccessMessages([])
    setIssueMessages([])

    try {
      // First, create the folder
      if (onAddFolders) {
        const folderResult = await onAddFolders([folderName])
        
        if (!folderResult?.success) {
          const errorMsg = folderResult?.message || 'Kon map niet aanmaken'
          toast.error(errorMsg)
          setIsUploadingFolder(false)
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

      // Then upload all files to the folder
      const successful = []
      const failed = []
      
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex]
        
        const formData = new FormData()
        formData.append('file', file)

        try {
          const result = await uploadDocumentForRole(folderName, formData)

          if (result?.success) {
            successful.push({
              file: file.name,
              folder: folderName
            })
          } else {
            failed.push({
              file: file.name,
              folder: folderName,
              error: result?.message || 'Upload mislukt'
            })
          }
        } catch (err) {
          console.error(`Upload error for ${file.name} to ${folderName}:`, err)
          failed.push({
            file: file.name,
            folder: folderName,
            error: err.message || 'Upload mislukt'
          })
        }
      }

      if (failed.length === 0 && successful.length > 0) {
        toast.success(`Alle documenten (${successful.length}) zijn geüpload naar map "${folderName}"`)
        const newSuccessMessages = [
          <SuccessBttn key="folder-upload" text={`Map "${folderName}" met ${successful.length} document${successful.length !== 1 ? 'en' : ''} geüpload`} />
        ]
        setSuccessMessages(newSuccessMessages)
        
        if (onRefresh) {
          await onRefresh()
        }
      } else if (successful.length > 0) {
        toast.warn(`Sommige documenten zijn geüpload. ${successful.length} succesvol, ${failed.length} mislukt.`)
        const newSuccessMessages = [
          <SuccessBttn key="folder-upload-partial" text={`Map "${folderName}" - ${successful.length} van ${files.length} documenten geüpload`} />
        ]
        setSuccessMessages(newSuccessMessages)
      } else {
        toast.error("Alle uploads zijn mislukt.")
        setErrorMessage(`Kon documenten niet uploaden naar map "${folderName}"`)
      }
      
      if (folderInputRef.current) {
        folderInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Folder upload error:', err)
      toast.error(`Fout bij uploaden van map: ${err.message || 'Onbekende fout'}`)
      setErrorMessage(`Fout bij uploaden van map: ${err.message || 'Onbekende fout'}`)
      
      if (folderInputRef.current) {
        folderInputRef.current.value = ''
      }
    } finally {
      setIsUploadingFolder(false)
    }
  }

  return (
    <>
      <div className="flex flex-col w-full gap-11">
        {/* Action Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Empty Folder Card */}
          <div 
            onClick={handleCreateEmptyFolder}
            className={`
              group relative flex flex-col rounded-2xl border-2 transition-all duration-200 cursor-pointer
              ${!canWrite || isUploadingFolder 
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
                  ${!canWrite || isUploadingFolder 
                    ? 'bg-gray-100' 
                    : 'bg-gradient-to-br from-[#23BD92] to-[#1ea87c] group-hover:from-[#1ea87c] group-hover:to-[#23BD92]'
                  }
                `}>
                  <svg 
                    width="24" 
                    height="24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={!canWrite || isUploadingFolder ? 'text-gray-400' : 'text-white'}
                  >
                    <path 
                      d="M12 4v16m8-8H4" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    font-montserrat font-bold text-lg leading-tight mb-2
                    ${!canWrite || isUploadingFolder ? 'text-gray-500' : 'text-gray-900'}
                  `}>
                    Maak een nieuwe lege map
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Je geeft de lege map een naam en voegt er later documenten aan toe.
                  </p>
                </div>
              </div>
              
              {/* Action Indicator */}
              {!(!canWrite || isUploadingFolder) && (
                <div className="flex items-center gap-2 text-[#23BD92] text-sm font-medium mt-2">
                  <span>Klik om te beginnen</span>
                  <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Upload Folder Card */}
          <div 
            onClick={handleFolderUploadClick}
            className={`
              group relative flex flex-col rounded-2xl border-2 transition-all duration-200 cursor-pointer
              ${!canWrite || isUploadingFolder 
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
                  ${!canWrite || isUploadingFolder 
                    ? 'bg-gray-100' 
                    : 'bg-gradient-to-br from-[#23BD92] to-[#1ea87c] group-hover:from-[#1ea87c] group-hover:to-[#23BD92]'
                  }
                `}>
                  <svg 
                    width="24" 
                    height="24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={!canWrite || isUploadingFolder ? 'text-gray-400' : 'text-white'}
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
                    ${!canWrite || isUploadingFolder ? 'text-gray-500' : 'text-gray-900'}
                  `}>
                    Upload bestaande map met documenten van je PC
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    De bestaande mapnaam en documenten worden overgenomen.
                  </p>
                </div>
              </div>
              
              {/* Action Indicator */}
              {!(!canWrite || isUploadingFolder) && (
                <div className="flex items-center gap-2 text-[#23BD92] text-sm font-medium mt-2">
                  <span>Klik om te uploaden</span>
                  <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input for folder upload */}
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFolderUpload}
          webkitdirectory=""
          directory=""
          multiple
          style={{ display: 'none' }}
        />

        {/* Folders Section - Show when creating empty folder or when folders exist */}
        {(showFolderInputs || folders.some(f => f.trim())) && (
          <div className="flex flex-col w-full">
            <span className="mb-2 font-montserrat text-[16px]">Voeg de map toe</span>
            
            {/* Success Messages */}
            {successMessages.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {successMessages.map((message, index) => (
                  <div key={`success-message-${index}`}>
                    {message}
                  </div>
                ))}
              </div>
            )}
            
            {/* Issue Messages */}
            {issueMessages.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {issueMessages.map((message, index) => (
                  <div key={`issue-message-${index}`}>
                    {message}
                  </div>
                ))}
              </div>
            )}
            
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Folder Inputs */}
            {folders.map((folder, index) => (
              <div key={index} className="flex mb-4 gap-3.5 items-center">
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => updateFolder(index, e.target.value)}
                  placeholder="Mapnaam..."
                  className={`w-1/3 h-12 rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent ${
                    lastAddedFolders.includes(folder.trim().replace(/^\/+|\/+$/g, "")) 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-[#D9D9D9]'
                  }`}
                />
                <div className="flex gap-1.5">
                  <button 
                    onClick={addFolder} 
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label="Nieuwe map toevoegen"
                  >
                    <AddIcon />
                  </button>
                  {folders.length > 1 && (
                    <button 
                      onClick={() => removeFolder(index)} 
                      type="button"
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      aria-label="Map verwijderen"
                    >
                      <RedCancelIcon />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Button - Show when folder inputs are visible */}
        {showFolderInputs && (
          <div className="flex flex-col w-1/3 gap-4">
            <div className="text-sm text-gray-500">
              {folders.filter(f => f.trim()).length} mappen ingevoerd
            </div>
            <button
              onClick={handleSave}
              disabled={loading || !canWrite || isUploadingFolder}
              className={`w-[95px] h-[50px] rounded-lg font-montserrat font-bold text-base text-white transition-colors ${
                loading || !canWrite || isUploadingFolder ? "bg-gray-400 cursor-not-allowed" : "bg-[#23BD92] hover:bg-[#1ea87c]"
              }`}
            >
              {loading ? "Opslaan..." : "Opslaan"}
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {isUploadingFolder && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-blue-700 font-medium">
              Bezig met uploaden van map en documenten...
            </p>
          </div>
        )}
      </div>
    </>
  )
}
