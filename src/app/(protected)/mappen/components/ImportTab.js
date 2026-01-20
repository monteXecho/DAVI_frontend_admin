'use client'

import { useState, useEffect, useMemo } from "react"
import { useApi } from "@/lib/useApi"
import CheckBox from "@/components/buttons/CheckBox"
import AddButton from "@/components/buttons/AddButton"
import SuccessBttn from "@/components/buttons/SuccessBttn"
import IssueBttn from "@/components/buttons/IssueBttn"

/**
 * ImportTab Component
 * 
 * Scenario B2: SharePoint → Nextcloud → DAVI (partial import)
 * 
 * Allows users to:
 * - List folders available in Nextcloud
 * - Select which folders to import into DAVI
 * - See which folders are already imported
 * - Import selected folders (creates DAVI records with origin="imported")
 */
export default function ImportTab({ onRefresh, canWrite = true }) {
  const { listImportableFolders, importFolders, syncFoldersFromNextcloud } = useApi()
  
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedPaths, setSelectedPaths] = useState(new Set())
  const [importRoot, setImportRoot] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [importResult, setImportResult] = useState(null)
  const [syncResult, setSyncResult] = useState(null)

  // Load folders from Nextcloud
  const loadFolders = async () => {
    setLoading(true)
    setError("")
    setSuccessMessage("")
    setImportResult(null)
    
    try {
      const result = await listImportableFolders(importRoot || null)
      if (result?.success) {
        if (result.configured === false) {
          // Nextcloud is not configured
          setFolders([])
          setError(result.message || "Nextcloud is niet geconfigureerd. Configureer NEXTCLOUD_URL, NEXTCLOUD_USERNAME en NEXTCLOUD_PASSWORD om folder import in te schakelen.")
        } else if (result?.folders) {
          setFolders(result.folders)
        } else {
          setFolders([])
        }
      } else {
        setError("Kon folders niet laden van Nextcloud")
      }
    } catch (err) {
      console.error("Failed to load folders:", err)
      setError(err?.response?.data?.detail || "Kon folders niet laden van Nextcloud")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFolders()
  }, [])

  // Handle folder selection
  const handleToggleFolder = (path) => {
    setSelectedPaths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  // Handle select all/none
  const handleSelectAll = (checked) => {
    const importableFolders = folders.filter(f => !f.imported && f.selectable !== false)
    if (checked) {
      setSelectedPaths(new Set(importableFolders.map(f => f.path)))
    } else {
      setSelectedPaths(new Set())
    }
  }

  // Handle import
  const handleImport = async () => {
    if (selectedPaths.size === 0) {
      setError("Selecteer ten minste één map om te importeren")
      return
    }

    setImporting(true)
    setError("")
    setSuccessMessage("")
    setImportResult(null)

    try {
      const result = await importFolders(Array.from(selectedPaths))
      
      if (result?.success) {
        setImportResult(result)
        setSuccessMessage(
          `${result.total_imported} map${result.total_imported !== 1 ? 'pen' : ''} geïmporteerd`
        )
        setSelectedPaths(new Set())
        
        // Refresh folder list and parent data
        await loadFolders()
        if (onRefresh) {
          onRefresh()
        }
      } else {
        setError("Import mislukt")
      }
    } catch (err) {
      console.error("Failed to import folders:", err)
      setError(err?.response?.data?.detail || "Import mislukt")
    } finally {
      setImporting(false)
    }
  }

  // Handle sync from Nextcloud
  const handleSync = async () => {
    setSyncing(true)
    setError("")
    setSuccessMessage("")
    setSyncResult(null)

    try {
      const result = await syncFoldersFromNextcloud()
      
      if (result?.success) {
        setSyncResult(result)
        if (result.new_documents > 0) {
          setSuccessMessage(
            `${result.new_documents} nieuw document${result.new_documents !== 1 ? 'en' : ''} gesynchroniseerd van Nextcloud`
          )
        } else {
          setSuccessMessage("Geen nieuwe documenten gevonden in Nextcloud")
        }
        
        // Refresh folder list and parent data
        await loadFolders()
        if (onRefresh) {
          onRefresh()
        }
      } else {
        setError("Synchronisatie mislukt")
      }
    } catch (err) {
      console.error("Failed to sync folders:", err)
      setError(err?.response?.data?.detail || "Synchronisatie mislukt")
    } finally {
      setSyncing(false)
    }
  }

  // Group folders by depth for tree view
  const folderTree = useMemo(() => {
    const tree = []
    const pathMap = new Map()
    
    folders.forEach(folder => {
      pathMap.set(folder.path, folder)
    })

    // Build tree structure
    folders.forEach(folder => {
      const parts = folder.path.split('/').filter(Boolean)
      let current = tree
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const pathSoFar = parts.slice(0, i + 1).join('/')
        
        let node = current.find(n => n.name === part)
        if (!node) {
          const fullFolder = pathMap.get(pathSoFar)
          node = {
            name: part,
            path: pathSoFar,
            depth: i,
            imported: fullFolder?.imported || false,
            selectable: fullFolder?.selectable !== false, // Default to true if not specified
            children: []
          }
          current.push(node)
        }
        
        current = node.children
      }
    })

    return tree
  }, [folders])

  // Render tree node recursively
  const renderTreeNode = (node, level = 0) => {
    const isSelected = selectedPaths.has(node.path)
    const hasChildren = node.children && node.children.length > 0
    const indent = level * 20
    const isSelectable = node.selectable !== false && !node.imported && canWrite

    return (
      <div key={node.path} className="mb-0.5">
        <div 
          className="flex items-center py-2.5 px-3 rounded-lg transition-all duration-150 hover:bg-[#F9FBFA] group"
          style={{ paddingLeft: `${indent + 12}px` }}
        >
          <div className="flex items-center flex-1 min-w-0">
            <CheckBox
              toggle={isSelected}
              onChange={(checked) => handleToggleFolder(node.path, checked)}
              disabled={!isSelectable}
              color="#23BD92"
            />
            <span className="ml-3 flex-1 text-sm font-medium text-gray-900 truncate">
              {node.name}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            {node.imported ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                Geïmporteerd
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Nieuw
              </span>
            )}
          </div>
        </div>
        {hasChildren && (
          <div className="ml-1">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const importableCount = folders.filter(f => !f.imported && f.selectable !== false).length
  const selectedCount = Array.from(selectedPaths).filter(path => {
    const folder = folders.find(f => f.path === path)
    return folder && !folder.imported && folder.selectable !== false
  }).length

  return (
    <div className="flex flex-col w-full">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Folders importeren van Nextcloud
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Selecteer folders die u wilt importeren van Nextcloud naar DAVI. 
          Al geïmporteerde folders zijn gemarkeerd en kunnen niet opnieuw worden geïmporteerd.
        </p>
      </div>

      {/* Import Root Input Card */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Import Root (optioneel)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={importRoot}
            onChange={(e) => setImportRoot(e.target.value)}
            placeholder="bijv. company123/admin456"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23BD92] focus:border-transparent transition-all"
          />
          <button
            onClick={loadFolders}
            disabled={loading}
            className="px-6 py-2.5 bg-[#23BD92] text-white rounded-lg text-sm font-semibold hover:bg-[#1ea87a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Laden...
              </span>
            ) : (
              "Vernieuwen"
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Laat leeg om alle beschikbare folders te tonen, of geef een specifiek pad op
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4">
          <IssueBttn text={error} />
        </div>
      )}
      {successMessage && (
        <div className="mb-4">
          <SuccessBttn text={successMessage} />
        </div>
      )}

      {/* Sync Result Details */}
      {syncResult && (
        <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Synchronisatie Resultaat
          </h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-700 mb-2">
                {syncResult.synced_folders} folder(s) gesynchroniseerd
              </p>
              <div className="text-xs text-gray-700 space-y-1">
                <p>• {syncResult.new_documents} nieuw document(en) toegevoegd</p>
                <p>• {syncResult.skipped_documents} document(en) overgeslagen (al aanwezig)</p>
              </div>
            </div>
            {syncResult.errors && syncResult.errors.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <p className="text-sm font-semibold text-red-700 mb-2">
                  Fouten ({syncResult.errors.length})
                </p>
                <ul className="text-xs text-red-600 space-y-1">
                  {syncResult.errors.map((error, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Result Details */}
      {importResult && (
        <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#23BD92]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Import Resultaat
          </h3>
          <div className="space-y-4">
            {importResult.imported && importResult.imported.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 font-semibold mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                    {importResult.total_imported}
                  </span>
                  Geïmporteerd
                </p>
                <ul className="text-xs text-gray-700 ml-7 space-y-1">
                  {importResult.imported.map((name, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {importResult.skipped && importResult.skipped.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-700 font-semibold mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                    {importResult.total_skipped}
                  </span>
                  Overgeslagen
                </p>
                <ul className="text-xs text-gray-700 ml-7 space-y-1">
                  {importResult.skipped.map((name, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-700 font-semibold mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                    {importResult.total_errors}
                  </span>
                  Fouten
                </p>
                <ul className="text-xs text-red-600 ml-7 space-y-1">
                  {importResult.errors.map((error, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Folder Tree Card */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#F9FBFA] border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckBox
                toggle={selectedCount > 0 && selectedCount === importableCount}
                onChange={handleSelectAll}
                disabled={!canWrite || importableCount === 0}
                color="#23BD92"
                indeterminate={selectedCount > 0 && selectedCount < importableCount}
              />
              <span className="text-sm font-semibold text-gray-900">
                Selecteer alles
              </span>
              <span className="text-xs text-gray-500 font-medium">
                ({selectedCount} van {importableCount} geselecteerd)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {folders.length} folder{folders.length !== 1 ? 's' : ''} totaal
              </span>
            </div>
          </div>
        </div>

        {/* Tree Content */}
        <div className="p-4 max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <span className="animate-spin rounded-full h-10 w-10 border-4 border-[#23BD92] border-t-transparent mb-3"></span>
              <span className="text-sm text-gray-500">Folders laden...</span>
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-900 mb-1">Geen folders gevonden</p>
              <p className="text-xs text-gray-500">Er zijn geen folders beschikbaar in Nextcloud voor dit pad.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {folderTree.map(node => renderTreeNode(node))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing || loading || importing}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            {syncing ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Synchroniseren...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Synchroniseer van Nextcloud
              </>
            )}
          </button>
          <p className="text-xs text-gray-500">
            Synchroniseer nieuwe documenten die direct in Nextcloud zijn geüpload
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadFolders}
            disabled={loading || importing || syncing}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Vernieuwen
          </button>
          {canWrite ? (
            <AddButton
              onClick={handleImport}
              text={
                importing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Importeren...
                  </span>
                ) : (
                  `Importeren (${selectedCount})`
                )
              }
              disabled={selectedCount === 0 || importing || loading || syncing}
            />
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-gray-500 text-sm font-medium">
                Alleen-lezen modus: U heeft geen schrijfrechten
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
