'use client'

import { useRef, useEffect, useState } from "react"
import DropdownMenu from "@/components/input/DropdownMenu"
import UploadBttn from '@/components/buttons/UploadBttn'
import UploadingBttn from '@/components/buttons/UploadingBttn'
import SuccessBttn from '@/components/buttons/SuccessBttn'
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

  const fileInputRef = useRef(null)

  // --- initialize roles ONLY on mount or roles change ---
  useEffect(() => {
    const roleList = roles.map(r => r.name)
    setRoleNames(roleList)

    // only auto-select default once
    if (!selectedRole && roleList.length > 0) {
      setSelectedRole(roleList[0])
    }
  }, [roles])  // ✅ correct — no need for selectedRole

  // --- react WHEN selectedRole changes ---
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
  }, [selectedRole, roles]) // ✅ correct

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDocumentUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!selectedRole || !selectedFolder) {
      alert("Please select both a role and a folder before uploading.")
      return
    }

    setUploadedFileName(file.name)
    setUploadStatus(UploadStates.UPLOADING)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await onUploadDocument(selectedRole, selectedFolder, formData)

      if (result?.success) {
        setUploadStatus(UploadStates.SUCCESS)
      } else {
        toast.warn(`${result.message}`)
        console.error("Upload failed or response invalid:", result)
        setUploadStatus(UploadStates.IDLE)
        setUploadedFileName("")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setUploadStatus(UploadStates.IDLE)
      setUploadedFileName("")
    }
  }

  const renderUploadSection = () => {
    switch (uploadStatus) {
      case UploadStates.IDLE:
        return <UploadBttn onClick={handleUploadClick} text="Upload document" />
      case UploadStates.UPLOADING:
        return <UploadingBttn text={uploadedFileName} />
      case UploadStates.SUCCESS:
        return (
          <>
            <SuccessBttn text={uploadedFileName} />
            <UploadBttn onClick={handleUploadClick} text="Upload another document" />
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
          <DropdownMenu
            value={selectedFolder}
            onChange={setSelectedFolder}
            allOptions={folders}
            disabled={folders.length === 0}
          />
        </div>
      </div>

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
