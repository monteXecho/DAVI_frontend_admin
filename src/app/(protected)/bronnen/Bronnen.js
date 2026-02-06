'use client'
import { useState, useEffect, useCallback } from "react"
import { useSources } from "@/lib/api/sources"
import UrlTab from "./components/UrlTab"
import HtmlTab from "./components/HtmlTab"

const tabsConfig = [
  { label: 'URL', component: UrlTab, selectable: true },
  { label: 'HTML', component: HtmlTab, selectable: true },
]

export default function Bronnen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const { getSources, addUrlSource, uploadHtmlSource, deleteSource, updateSource, syncSources } = useSources()
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState(null)
  const [nextSync, setNextSync] = useState(null)

  const ActiveComponent = tabsConfig[activeIndex].component

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getSources()
      if (res?.sources) {
        setSources(res.sources)
      }
      // Update sync times from API response
      if (res?.last_sync) {
        setLastSync(new Date(res.last_sync))
      }
      if (res?.next_sync) {
        setNextSync(new Date(res.next_sync))
      }
    } catch (err) {
      console.error("Failed to fetch sources:", err)
    } finally {
      setLoading(false)
    }
  }, [getSources])

  useEffect(() => {
    fetchSources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const handleAddUrl = async (data) => {
    try {
      if (data.sourceId) {
        // Edit mode - update existing source
        await updateSource(data.sourceId, data.status)
      } else {
        // Add mode - create new source
        await addUrlSource(data.url)
      }
      await fetchSources()
    } catch (err) {
      throw err
    }
  }

  const handleUploadHtml = async (file) => {
    try {
      await uploadHtmlSource(file)
      await fetchSources()
    } catch (err) {
      throw err
    }
  }

  const handleDeleteSource = async (sourceIds) => {
    try {
      // Delete can be single or multiple
      if (Array.isArray(sourceIds)) {
        for (const id of sourceIds) {
          await deleteSource(id)
        }
      } else {
        await deleteSource(sourceIds)
      }
      await fetchSources()
    } catch (err) {
      console.error("Failed to delete source:", err)
      throw err
    }
  }

  const handleUpdateSource = async (sourceId, status) => {
    try {
      await updateSource(sourceId, status)
      await fetchSources()
    } catch (err) {
      console.error("Failed to update source:", err)
      throw err
    }
  }

  const handleSync = async () => {
    try {
      const res = await syncSources()
      // Update sync times from sync response
      if (res?.last_sync) {
        setLastSync(new Date(res.last_sync))
      }
      if (res?.next_sync) {
        setNextSync(new Date(res.next_sync))
      }
      await fetchSources()
    } catch (err) {
      console.error("Failed to sync sources:", err)
      throw err
    }
  }

  const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const months = ["januari", "februari", "maart", "april", "mei", "juni", 
                    "juli", "augustus", "september", "oktober", "november", "december"]
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  const formatDateTime = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const months = ["januari", "februari", "maart", "april", "mei", "juni", 
                    "juli", "augustus", "september", "oktober", "november", "december"]
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} om ${hours}:${minutes}`
  }

  const formatNextSync = (date) => {
    if (!date) return ""
    const now = new Date()
    const d = new Date(date)
    if (d.toDateString() === now.toDateString()) {
      return `Vannacht om ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    return formatDateTime(date)
  }

  return (
    <div className="flex flex-col w-full h-full p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-montserrat mb-2">Bronnen</h1>
        <p className="text-gray-600 font-montserrat">
          Beheer welke websites worden gebruikt voor branche-antwoorden.
        </p>
        
        {/* Sync Information */}
        {(lastSync || nextSync) && (
          <div className="mt-4 text-sm text-gray-600 font-montserrat flex flex-col gap-1">
            {lastSync && (
              <div>
                <span className="font-bold">Laatste synchronisatie:</span> {formatDateTime(lastSync)}.
              </div>
            )}
            {nextSync && (
              <div>
                <span className="font-bold">Volgende synchronisatie:</span> {formatNextSync(nextSync)}.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabsConfig.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`px-6 py-3 font-montserrat font-medium transition-colors ${
              activeIndex === index
                ? "border-b-2 border-[#23BD92] text-[#23BD92]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="flex-1">
        <ActiveComponent
          sources={sources}
          loading={loading}
          onAddUrl={handleAddUrl}
          onUploadHtml={handleUploadHtml}
          onDelete={handleDeleteSource}
          onUpdate={handleUpdateSource}
          onSync={handleSync}
          formatDate={formatDate}
          lastSync={lastSync}
          nextSync={nextSync}
          formatDateTime={formatDateTime}
          formatNextSync={formatNextSync}
        />
      </div>
    </div>
  )
}
