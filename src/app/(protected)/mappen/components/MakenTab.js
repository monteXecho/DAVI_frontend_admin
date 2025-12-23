'use client'

import { useState } from "react"
import AddIcon from "@/components/icons/AddIcon"
import RedCancelIcon from "@/components/icons/RedCancelIcon"
import SuccessBttn from "@/components/buttons/SuccessBttn"
import IssueBttn from "@/components/buttons/IssueBttn"

export default function MakenTab({ onAddFolders, canWrite = true }) {
  const [folders, setFolders] = useState([""])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessages, setSuccessMessages] = useState([]) 
  const [issueMessages, setIssueMessages] = useState([]) 
  const [lastAddedFolders, setLastAddedFolders] = useState([])

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

  return (
    <>
      <div className="flex flex-col w-full gap-11">
        {/* Folders Section */}
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

        {/* Save Button */}
        <div className="flex flex-col w-1/3 gap-4">
          <div className="text-sm text-gray-500">
            {folders.filter(f => f.trim()).length} mappen ingevoerd
          </div>
          <button
            onClick={handleSave}
            disabled={loading || !canWrite}
            className={`w-[95px] h-[50px] rounded-lg font-montserrat font-bold text-base text-white transition-colors ${
              loading || !canWrite ? "bg-gray-400 cursor-not-allowed" : "bg-[#23BD92] hover:bg-[#1ea87c]"
            }`}
          >
            {loading ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      </div>
    </>
  )
}