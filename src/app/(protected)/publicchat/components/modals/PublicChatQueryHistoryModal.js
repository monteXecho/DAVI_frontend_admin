'use client'

import { useEffect, useState, useCallback } from 'react'

function formatNlDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function HistoryAccordionRow({
  row,
  variant,
  open,
  onToggle,
}) {
  const isOk = variant === 'with_answer'
  return (
    <li
      className={`rounded-lg border text-left overflow-hidden ${
        isOk ? 'border-gray-200 bg-[#FAFFFE]' : 'border-amber-100 bg-amber-50/50'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-black/[0.02] transition-colors"
        aria-expanded={open}
      >
        <span
          className={`mt-1 shrink-0 w-6 h-6 flex items-center justify-center rounded text-xs font-semibold font-montserrat ${
            isOk ? 'bg-[#23BD92]/15 text-[#1a986f]' : 'bg-amber-100 text-amber-900'
          }`}
          aria-hidden
        >
          {open ? '−' : '+'}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-xs text-gray-500 font-montserrat mb-1">{formatNlDate(row.created_at)}</span>
          <span className="block font-montserrat text-sm text-gray-900 font-medium break-words">{row.question}</span>
        </span>
      </button>
      {open && (
        <div
          className={`px-3 pb-3 pt-0 pl-[3.25rem] border-t border-black/[0.06] ${isOk ? '' : 'border-amber-200/60'}`}
        >
          {row.answer && (
            <div className="mt-3">
              <p className="font-montserrat text-[10px] uppercase tracking-wide text-gray-400 mb-1">Antwoord</p>
              <div className="font-montserrat text-xs text-gray-700 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                {row.answer}
              </div>
            </div>
          )}
          {row.error_detail && (
            <div className={`mt-3 ${row.answer ? '' : 'mt-3'}`}>
              <p className="font-montserrat text-[10px] uppercase tracking-wide text-gray-400 mb-1">Detail</p>
              <p
                className={`font-montserrat text-xs break-words ${isOk ? 'text-gray-600' : 'text-amber-900'}`}
              >
                {row.error_detail}
              </p>
            </div>
          )}
          {!row.answer && !row.error_detail && (
            <p className="mt-3 font-montserrat text-xs text-gray-500 italic">Geen extra detail.</p>
          )}
        </div>
      )}
    </li>
  )
}

export default function PublicChatQueryHistoryModal({ chatName, chatId, loadHistory, onClose }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [openIds, setOpenIds] = useState(() => new Set())

  const toggleOpen = useCallback((id) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await loadHistory(chatId)
        if (!cancelled) setData(res)
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.detail || e.message || 'Laden mislukt')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [chatId, loadHistory])

  useEffect(() => {
    setOpenIds(new Set())
  }, [chatId])

  const withAnswer = data?.with_answer ?? []
  const withoutAnswer = data?.without_answer ?? []

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#C5BEBE]">
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="font-montserrat font-bold text-lg text-gray-900">Vraaggeschiedenis</h2>
            <p className="font-montserrat text-sm text-gray-600 mt-1">{chatName || 'Chat'}</p>
            {!loading && data?.counts && (
              <p className="font-montserrat text-xs text-gray-500 mt-1">
                {data.counts.with_answer} met antwoord · {data.counts.without_answer} zonder antwoord (max. 500 recent)
              </p>
            )}
            {!loading && !error && (
              <p className="font-montserrat text-xs text-gray-400 mt-1">
                Tik op een vraag om het antwoord of detail te bekijken.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 font-montserrat text-sm px-2"
            aria-label="Sluiten"
          >
            Sluiten
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex justify-center py-12 font-montserrat text-gray-500">Laden…</div>
          )}
          {!loading && error && (
            <div className="rounded-lg bg-red-50 text-red-800 px-4 py-3 font-montserrat text-sm">{error}</div>
          )}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section>
                <h3 className="font-montserrat font-semibold text-[#23BD92] mb-3 text-sm">
                  Met antwoord ({withAnswer.length})
                </h3>
                {withAnswer.length === 0 ? (
                  <p className="text-sm text-gray-500 font-montserrat italic">Geen vragen met antwoord opgeslagen.</p>
                ) : (
                  <ul className="space-y-2">
                    {withAnswer.map((row) => (
                      <HistoryAccordionRow
                        key={row.id}
                        row={row}
                        variant="with_answer"
                        open={openIds.has(row.id)}
                        onToggle={() => toggleOpen(row.id)}
                      />
                    ))}
                  </ul>
                )}
              </section>
              <section>
                <h3 className="font-montserrat font-semibold text-amber-700 mb-3 text-sm">
                  Zonder antwoord ({withoutAnswer.length})
                </h3>
                {withoutAnswer.length === 0 ? (
                  <p className="text-sm text-gray-500 font-montserrat italic">
                    Geen vragen zonder inhoudelijk antwoord opgeslagen.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {withoutAnswer.map((row) => (
                      <HistoryAccordionRow
                        key={row.id}
                        row={row}
                        variant="without_answer"
                        open={openIds.has(row.id)}
                        onToggle={() => toggleOpen(row.id)}
                      />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
