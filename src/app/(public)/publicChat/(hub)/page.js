'use client'

import { useLayoutEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { readRememberedPublicChatPath, rememberPublicChatPath } from '@/lib/publicChatResume'

/**
 * PWA launcher when middleware had no resume cookie yet (first visit / cleared cookies).
 */
export default function PublicChatStartPage() {
  const router = useRouter()
  const [showHelp, setShowHelp] = useState(false)

  useLayoutEffect(() => {
    const path = readRememberedPublicChatPath()
    if (path) {
      rememberPublicChatPath(path)
      router.replace(path)
      return undefined
    }
    const id = window.setTimeout(() => setShowHelp(true), 400)
    return () => window.clearTimeout(id)
  }, [router])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12 font-montserrat">
      <div className="max-w-lg w-full text-center space-y-5 rounded-2xl bg-white shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900">DAVI-chat</h1>
        {showHelp ? (
          <>
            <p className="text-slate-600 text-sm leading-relaxed">
              Open de chatlink die u van uw organisatie heeft gekregen.
              Die ziet er ongeveer zo uit:
            </p>
            <p className="font-mono text-xs text-slate-800 break-all bg-slate-100 rounded-lg px-3 py-2 text-left">
              …/publicChat/<span className="text-slate-500">admin-id</span>/
              <span className="text-slate-500">chatnaam</span>
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              <strong className="text-slate-600">App geïnstalleerd?</strong> Bezoek uw chatlink
              één keer in deze browser. Daarna opent deze pagina automatisch uw laatste chat.
            </p>
          </>
        ) : (
          <p className="text-slate-500 text-sm">Bezig met openen…</p>
        )}
      </div>
    </main>
  )
}
