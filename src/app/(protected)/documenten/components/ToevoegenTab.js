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
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [uploadStatus, setUploadStatus] = useState(UploadStates.IDLE)
  
  // Array to store multiple role-folder combinations
  const [uploadTargets, setUploadTargets] = useState([])
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0)

  const fileInputRef = useRef(null)

  // Initialize roles
  useEffect(() => {
    const roleList = roles.map(r => r.name)
    setRoleNames(roleList)

    if (!selectedRole && roleList.length > 0) {
      setSelectedRole(roleList[0])
    }
  }, [roles])

  // Update folders when selected role changes
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

  // Add current role-folder combination to upload targets
  const handleAddUploadTarget = () => {
    if (!selectedRole || !selectedFolder) {
      toast.warn("Please select both a role and a folder.")
      return
    }

    const targetExists = uploadTargets.some(
      target => target.role === selectedRole && target.folder === selectedFolder
    )

    if (targetExists) {
      toast.warn("This role-folder combination is already added.")
      return
    }

    setUploadTargets(prev => [
      ...prev,
      { role: selectedRole, folder: selectedFolder }
    ])
  }

  // Remove role-folder combination from upload targets
  const handleRemoveUploadTarget = (index) => {
    setUploadTargets(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadClick = () => {
    if (uploadTargets.length === 0) {
      toast.warn("Please add at least one role-folder combination before uploading.")
      return
    }
    fileInputRef.current?.click()
  }

  const handleDocumentUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (uploadTargets.length === 0) {
      toast.warn("Please add at least one role-folder combination.")
      return
    }

    setUploadedFileName(file.name)
    setUploadStatus(UploadStates.UPLOADING)
    setCurrentUploadIndex(0)

    // Upload to all targets sequentially
    await uploadToAllTargets(file)
  }

  const uploadToAllTargets = async (file) => {
    for (let i = 0; i < uploadTargets.length; i++) {
      setCurrentUploadIndex(i)
      const target = uploadTargets[i]
      
      const formData = new FormData()
      formData.append('file', file)

      try {
        const result = await onUploadDocument(target.role, target.folder, formData)

        if (!result?.success) {
          toast.warn(`Failed to upload to ${target.role}/${target.folder}: ${result?.message || 'Unknown error'}`)
          // Continue with other uploads even if one fails
        }
      } catch (err) {
        console.error(`Upload error for ${target.role}/${target.folder}:`, err)
        toast.warn(`Failed to upload to ${target.role}/${target.folder}`)
        // Continue with other uploads even if one fails
      }
    }

    setUploadStatus(UploadStates.SUCCESS)
  }

  const renderUploadSection = () => {
    switch (uploadStatus) {
      case UploadStates.IDLE:
        return <UploadBttn onClick={handleUploadClick} text="Upload document" />
      case UploadStates.UPLOADING:
        const progressText = uploadTargets.length > 1 
          ? `Uploading to ${currentUploadIndex + 1}/${uploadTargets.length}: ${uploadTargets[currentUploadIndex].role}/${uploadTargets[currentUploadIndex].folder}`
          : `Uploading to ${uploadTargets[0].role}/${uploadTargets[0].folder}`
        
        return <UploadingBttn text={`${uploadedFileName} - ${progressText}`} />
      case UploadStates.SUCCESS:
        return (
          <>
            <SuccessBttn text={`${uploadedFileName} - Uploaded to ${uploadTargets.length} location(s)`} />
            <UploadBttn onClick={handleUploadClick} text="Upload nog een document" />
          </>
        )
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
      />

      {renderUploadSection()}
      
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  )
}