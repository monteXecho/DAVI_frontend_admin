'use client'

import { useEffect, useState } from 'react'
import { Download, Copy, X } from 'lucide-react'
import { toast } from 'react-toastify'
import QRCode from 'qrcode'

function safeFileName(chatName) {
  const base = (chatName || 'chat').replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, '-').slice(0, 80)
  return base || 'chat'
}

async function copyQrImageToClipboard(dataUrl) {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const type = blob.type || 'image/png'
  try {
    await navigator.clipboard.write([new ClipboardItem({ [type]: blob })])
    return true
  } catch {
    try {
      const pngBlob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })])
      return true
    } catch {
      return false
    }
  }
}

function downloadQrPng(dataUrl, chatName) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `qr-public-chat-${safeFileName(chatName)}.png`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export default function PublicChatQrModal({ url, chatName, onClose }) {
  const [dataUrl, setDataUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [genError, setGenError] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!url) {
      setLoading(false)
      return undefined
    }
    setLoading(true)
    setGenError(null)
    setDataUrl('')
    const opts = {
      width: 280,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }
    QRCode.toDataURL(url, opts)
      .then((png) => {
        if (!cancelled) setDataUrl(png)
      })
      .catch((e) => {
        if (!cancelled) {
          setGenError(e?.message || 'QR-code kon niet worden gegenereerd.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [url])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleCopyImage = async () => {
    if (!dataUrl) return
    const ok = await copyQrImageToClipboard(dataUrl)
    if (ok) toast.success('QR-code gekopieerd naar het klembord (afbeelding).')
    else toast.error('Kopiëren als afbeelding lukt niet in deze browser. Gebruik Downloaden.')
  }

  const handleDownload = () => {
    if (!dataUrl) return
    downloadQrPng(dataUrl, chatName)
    toast.success('QR-code gedownload als PNG.')
  }

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full flex flex-col border border-[#C5BEBE]"
        role="dialog"
        aria-labelledby="qr-modal-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 id="qr-modal-title" className="font-montserrat font-bold text-lg text-gray-900">
              QR-code publieke chat
            </h2>
            <p className="font-montserrat text-sm text-gray-600 mt-1">{chatName || 'Chat'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center">
          <p className="font-montserrat text-xs text-gray-500 text-center mb-4 break-all w-full">
            {url}
          </p>

          {loading && (
            <div className="h-[280px] w-[280px] flex items-center justify-center font-montserrat text-gray-500">
              QR-code wordt gemaakt…
            </div>
          )}
          {genError && !loading && (
            <div className="rounded-lg bg-red-50 text-red-800 px-4 py-3 font-montserrat text-sm text-center w-full">
              {genError}
            </div>
          )}
          {!loading && !genError && dataUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- data URL from qrcode
            <img
              src={dataUrl}
              alt="QR-code met link naar de publieke chat"
              className="w-[280px] h-[280px] rounded-lg border border-gray-200 bg-white"
            />
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
            <button
              type="button"
              disabled={!dataUrl || loading}
              onClick={handleCopyImage}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#23BD92] text-white font-montserrat text-sm font-medium hover:bg-[#1ea67f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Copy className="w-4 h-4 shrink-0" aria-hidden />
              Kopieer afbeelding
            </button>
            <button
              type="button"
              disabled={!dataUrl || loading}
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-montserrat text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden />
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
