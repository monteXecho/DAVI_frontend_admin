'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * In-page install entry: captures `beforeinstallprompt` so we can mirror the omnibox install icon.
 * iOS Safari has no BIP — show a short “Add to Home Screen” hint instead.
 */
export default function PublicChatInstallButton({ className = '' }) {
  const deferredRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [hasDeferredPrompt, setHasDeferredPrompt] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isSt =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      /** @type {Navigator & { standalone?: boolean }} */ (window.navigator)
        .standalone === true
    setStandalone(isSt)
    if (isSt) return undefined

    const ua = window.navigator.userAgent || ''
    const isIosDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIos(isIosDevice)

    const onBip = (e) => {
      e.preventDefault()
      deferredRef.current = e
      setHasDeferredPrompt(true)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    const onInstalled = () => {
      deferredRef.current = null
      setHasDeferredPrompt(false)
      setStandalone(true)
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const onInstall = useCallback(async () => {
    const ev = deferredRef.current
    if (!ev || typeof ev.prompt !== 'function') return
    await ev.prompt()
    deferredRef.current = null
    setHasDeferredPrompt(false)
  }, [])

  if (!mounted || standalone) return null

  if (hasDeferredPrompt && deferredRef.current) {
    return (
      <button
        type="button"
        onClick={onInstall}
        className={`inline-flex items-center gap-2 rounded-xl border border-[#23BD92]/40 bg-[#23BD92]/10 px-3 py-2 text-sm font-semibold text-[#1ea87c] font-montserrat shadow-sm hover:bg-[#23BD92]/15 active:scale-[0.98] transition ${className}`}
        aria-label="App installeren"
      >
        <svg
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <span className="hidden sm:inline">App installeren</span>
      </button>
    )
  }

  if (ios) {
    return (
      <p
        className={`max-w-[11rem] text-right text-xs leading-snug text-gray-500 font-montserrat sm:max-w-xs ${className}`}
      >
        Tip: tik op{' '}
        <span className="font-semibold text-gray-700">Delen</span> en kies{' '}
        <span className="font-semibold text-gray-700">Zet op beginscherm</span>
      </p>
    )
  }

  return (
    <p
      className={`text-right text-[11px] leading-snug text-gray-500 font-montserrat max-w-[10rem] sm:text-xs sm:max-w-[14rem] ${className}`}
    >
      Via browsermenu <span className="whitespace-nowrap">(⋮)</span>:{' '}
      <span className="font-semibold text-gray-600">App installeren</span>
    </p>
  )
}
