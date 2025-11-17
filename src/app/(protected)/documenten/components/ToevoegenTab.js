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
}

export default function ToevoegenTab({ roles = [], onUploadDocument }) {
  const [roleNames, setRoleNames] = useState([])
  const [selectedRole, setSelectedRole] = useState("")
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState([]) 
  const [uploadStatus, setUploadStatus] = useState(UploadStates.IDLE)
  
  const [uploadTargets, setUploadTargets] = useState([])
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0) 

  const fileInputRef = useRef(null)

  useEffect(() => {
    const roleList = roles.map(r => r.name)
    setRoleNames(roleList)

    if (!selectedRole && roleList.length > 0) {
      setSelectedRole(roleList[0])
    }
  }, [roles, selectedRole])

  useEffect(() => {
    if (!selectedRole) {
      setFolders([])
      setSelectedFolder("")
      return
    }

    const roleData = roles.find(r => r.name === selectedRole)
    const folderList = roleData?.folders || []

    setFolders(folderList)
    setSelectedFolder(folderList[0] || "")
  }, [selectedRole, roles])

  const handleAddUploadTarget = () => {
    if (!selectedRole || !selectedFolder) {
      toast.warn("Selecteer zowel een rol als een map.")
      return
    }

    const targetExists = uploadTargets.some(
      target => target.role === selectedRole && target.folder === selectedFolder
    )

    if (targetExists) {
      toast.warn("Deze rol-map combinatie bestaat al.")
      return
    }

    setUploadTargets(prev => [
      ...prev,
      { role: selectedRole, folder: selectedFolder }
    ])
  }

  const handleRemoveUploadTarget = (index) => {
    setUploadTargets(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadClick = () => {
    if (uploadTargets.length === 0) {
      toast.warn("Voeg minimaal één rol-mapcombinatie toe voordat u uploadt.")
      return
    }
    fileInputRef.current?.click()
  }

  const handleDocumentUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (uploadTargets.length === 0) {
      toast.warn("Voeg minimaal één rol-mapcombinatie toe.")
      return
    }

    setUploadedFiles(files)
    setUploadStatus(UploadStates.UPLOADING)
    setCurrentFileIndex(0)
    setCurrentUploadIndex(0)

    await uploadAllFiles(files)
  }

  const uploadAllFiles = async (files) => {
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      setCurrentFileIndex(fileIndex)
      const file = files[fileIndex]
      
      for (let targetIndex = 0; targetIndex < uploadTargets.length; targetIndex++) {
        setCurrentUploadIndex(targetIndex)
        const target = uploadTargets[targetIndex]
        
        const formData = new FormData()
        formData.append('file', file)

        try {
          const result = await onUploadDocument(target.role, target.folder, formData)

          if (!result?.success) {
            toast.warn(`Upload mislukt voor ${file.name} naar ${target.role} / ${target.folder}: ${result?.message || 'Onbekende fout'}`)
          }
        } catch (err) {
          console.error(`Upload error for ${file.name} to ${target.role}/${target.folder}:`, err)
          toast.warn(`Upload van ${file.name} naar ${target.role}/${target.folder} is mislukt`)
        }
      }
    }

    setUploadStatus(UploadStates.SUCCESS)
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
          progressText += `Bezig met uploaden naar ${currentUploadIndex + 1}/${uploadTargets.length}: ${uploadTargets[currentUploadIndex].role}/${uploadTargets[currentUploadIndex].folder}`
        } else {
          progressText += `Bezig met uploaden naar ${uploadTargets[0].role}/${uploadTargets[0].folder}`
        }
        
        return <UploadingBttn text={progressText} />
      case UploadStates.SUCCESS:
        const totalUploads = uploadedFiles.length * uploadTargets.length
        
        // Create a custom component for multiple files
        if (uploadedFiles.length > 1) {
          return (
            <div className="flex flex-col w-2/3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 font-semibold mb-2">
                  Successvol geüpload ({uploadedFiles.length} documenten):
                </div>
                <div className="text-green-700 text-sm">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="ml-2">
                      • {file.name}
                    </div>
                  ))}
                </div>
                {uploadTargets.length > 1 && (
                  <div className="text-green-600 text-xs mt-2">
                    Naar {uploadTargets.length} bestemmingen geüpload
                  </div>
                )}
              </div>
              <UploadBttn onClick={handleUploadClick} text="Meer documenten uploaden" />
            </div>
          )
        } else {
          // Single file - use the original SuccessBttn
          return (
            <>
              <SuccessBttn text={uploadedFiles[0]?.name} />
              <UploadBttn onClick={handleUploadClick} text="Meer documenten uploaden" />
            </>
          )
        }
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-11 w-full justify-between">
      <div className="flex w-full gap-5">
        <div className="flex flex-col w-1/3">
          <span className="mb-2 font-montserrat text-[16px]">Kies een rol</span>
          <DropdownMenu
            value={selectedRole}
            onChange={setSelectedRole}
            allOptions={roleNames}
          />
        </div>

        <div className="flex flex-col w-1/3">
          <span className="mb-2 font-montserrat text-[16px]">Kies een map</span>
          <div className="flex gap-2">
            <div className="flex-1">
              <DropdownMenu
                value={selectedFolder}
                onChange={setSelectedFolder}
                allOptions={folders}
                disabled={folders.length === 0}
              />
            </div>
            <button
              onClick={handleAddUploadTarget}
              title="Add role-folder combination"
            >
              <AddIcon />
            </button>
          </div>
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
                  {target.role} / {target.folder}
                </span>
                <button
                  onClick={() => handleRemoveUploadTarget(index)}
                  title="Remove"
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
      />

      {renderUploadSection()}
      
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  )
}