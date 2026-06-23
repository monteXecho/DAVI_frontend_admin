'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'

function formatNlDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function sourceDisplayLabel(source) {
  if (!source) return 'Bron'
  if (source.type === 'url' && source.url) return source.url
  return source.file_name || source.url || 'Bron'
}

function sourceIdsFromRow(row) {
  const list = row?.display_sources?.length
    ? row.display_sources
  : row?.corrected_sources?.length
    ? row.corrected_sources
    : row?.rag_sources || []
  return list.map((s) => s.source_id).filter(Boolean)
}

function mergeHistoryRow(data, updatedRow) {
  const strip = (list) => (list || []).filter((r) => r.id !== updatedRow.id)
  const withStripped = strip(data.with_answer)
  const withoutStripped = strip(data.without_answer)
  if (updatedRow.has_answer) {
    withStripped.unshift(updatedRow)
  } else {
    withoutStripped.unshift(updatedRow)
  }
  return {
    ...data,
    with_answer: withStripped,
    without_answer: withoutStripped,
    counts: {
      with_answer: withStripped.length,
      without_answer: withoutStripped.length,
    },
  }
}

function SourceCorrectionPanel({
  row,
  chatSources,
  canWrite,
  onSave,
}) {
  const [draftIds, setDraftIds] = useState(() => sourceIdsFromRow(row))
  const [addId, setAddId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraftIds(sourceIdsFromRow(row))
    setAddId('')
  }, [row.id, row.sources_corrected_at, row.answer])

  const activeChatSources = useMemo(
    () => (chatSources || []).filter((s) => s.status === 'active'),
    [chatSources],
  )

  const draftSources = useMemo(() => {
    const byId = Object.fromEntries(activeChatSources.map((s) => [s.id, s]))
    return draftIds.map((id) => {
      const fromRow = [...(row.rag_sources || []), ...(row.corrected_sources || [])].find(
        (s) => s.source_id === id,
      )
      const fromChat = byId[id]
      if (fromChat) {
        return {
          source_id: id,
          type: fromChat.type,
          file_name: fromChat.file_name,
          url: fromChat.url,
        }
      }
      return fromRow || { source_id: id, type: '', file_name: id, url: null }
    })
  }, [draftIds, activeChatSources, row])

  const availableToAdd = useMemo(
    () => activeChatSources.filter((s) => !draftIds.includes(s.id)),
    [activeChatSources, draftIds],
  )

  const handleAdd = () => {
    if (!addId || draftIds.includes(addId)) return
    setDraftIds((prev) => [...prev, addId])
    setAddId('')
  }

  const handleRemove = (sourceId) => {
    setDraftIds((prev) => prev.filter((id) => id !== sourceId))
  }

  const handleSave = async () => {
    if (!draftIds.length) {
      toast.error('Selecteer minimaal één bron uit deze QR-Chat.')
      return
    }
    setSaving(true)
    try {
      await onSave(row.id, draftIds)
      toast.success('Bronnen opgeslagen en antwoord opnieuw gegenereerd.')
    } catch (e) {
      toast.error(e?.response?.data?.detail || e.message || 'Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const corrected = Boolean(row.sources_corrected_at)
  const displayList = row.display_sources || []

  return (
    <div className="mt-3 space-y-3">
      <div>
        <p className="font-montserrat text-[10px] uppercase tracking-wide text-gray-400 mb-1">
          Bronnen {corrected ? '(gecorrigeerd)' : row.rag_sources?.length ? '(AI)' : ''}
        </p>
        {displayList.length === 0 ? (
          <p className="font-montserrat text-xs text-gray-500 italic">
            Geen bronnen opgeslagen voor deze vraag.
          </p>
        ) : (
          <ul className="space-y-1">
            {displayList.map((s) => (
              <li
                key={s.source_id || s.file_id || sourceDisplayLabel(s)}
                className="font-montserrat text-xs text-gray-700 break-all rounded-md bg-gray-50 px-2 py-1.5 border border-gray-100"
              >
                {sourceDisplayLabel(s)}
              </li>
            ))}
          </ul>
        )}
        {corrected && row.rag_sources?.length > 0 && (
          <details className="mt-2">
            <summary className="font-montserrat text-[11px] text-gray-500 cursor-pointer">
              Oorspronkelijke AI-bronnen
            </summary>
            <ul className="mt-1 space-y-1 pl-1">
              {row.rag_sources.map((s) => (
                <li key={s.source_id || s.file_id} className="font-montserrat text-[11px] text-gray-500 break-all">
                  {sourceDisplayLabel(s)}
                </li>
              ))}
            </ul>
          </details>
        )}
        {corrected && row.sources_corrected_at && (
          <p className="font-montserrat text-[10px] text-gray-400 mt-1">
            Gecorrigeerd op {formatNlDate(row.sources_corrected_at)}
            {row.sources_corrected_by ? ` door ${row.sources_corrected_by}` : ''}
          </p>
        )}
      </div>

      {canWrite && (
        <div className="rounded-lg border border-[#23BD92]/30 bg-[#FAFFFE] p-3 space-y-3">
          <p className="font-montserrat text-xs font-semibold text-gray-800">Bronnen corrigeren</p>
          <p className="font-montserrat text-[11px] text-gray-600 leading-relaxed">
            Kies alleen bronnen die al in deze QR-Chat staan. Het antwoord wordt opnieuw gegenereerd met
            uitsluitend de geselecteerde bronnen.
          </p>

          {draftSources.length === 0 ? (
            <p className="font-montserrat text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
              Voeg minimaal één bron toe.
            </p>
          ) : (
            <ul className="space-y-2">
              {draftSources.map((s) => (
                <li
                  key={s.source_id}
                  className="flex items-start justify-between gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5"
                >
                  <span className="font-montserrat text-xs text-gray-800 break-all flex-1 min-w-0">
                    {sourceDisplayLabel(s)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(s.source_id)}
                    className="shrink-0 text-xs font-montserrat text-red-600 hover:text-red-800"
                  >
                    Verwijderen
                  </button>
                </li>
              ))}
            </ul>
          )}

          {availableToAdd.length > 0 ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={addId}
                onChange={(e) => setAddId(e.target.value)}
                className="flex-1 min-w-0 h-9 rounded-lg border border-gray-300 px-2 text-xs font-montserrat"
              >
                <option value="">Bron toevoegen…</option>
                {availableToAdd.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.type === 'url' ? s.url : s.file_name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!addId}
                onClick={handleAdd}
                className="h-9 px-3 rounded-lg border border-[#23BD92] text-[#1ea87c] text-xs font-montserrat font-medium hover:bg-[#23BD92]/10 disabled:opacity-40"
              >
                Toevoegen
              </button>
            </div>
          ) : (
            <p className="font-montserrat text-[11px] text-gray-500">
              {activeChatSources.length === 0
                ? 'Geen actieve bronnen in deze QR-Chat. Voeg eerst bronnen toe onder Wijzigen.'
                : 'Alle beschikbare bronnen zijn geselecteerd.'}
            </p>
          )}

          <button
            type="button"
            disabled={saving || draftIds.length === 0}
            onClick={handleSave}
            className="w-full h-10 rounded-lg bg-[#23BD92] text-white font-montserrat text-sm font-semibold hover:bg-[#1ea87c] disabled:opacity-50"
          >
            {saving ? 'Bezig…' : 'Opslaan en antwoord opnieuw genereren'}
          </button>
        </div>
      )}
    </div>
  )
}

function HistoryAccordionRow({
  row,
  variant,
  open,
  onToggle,
  chatSources,
  canWrite,
  onSaveSources,
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
          {row.answer_from_correction && (
            <span className="inline-block mt-1 text-[10px] font-montserrat uppercase tracking-wide text-[#23BD92]">
              Gecorrigeerd
            </span>
          )}
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
            <div className="mt-3">
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

          <SourceCorrectionPanel
            row={row}
            chatSources={chatSources}
            canWrite={canWrite}
            onSave={onSaveSources}
          />
        </div>
      )}
    </li>
  )
}

export default function PublicChatQueryHistoryModal({
  chatName,
  chatId,
  loadHistory,
  getChatSources,
  correctQueryHistorySources,
  canWrite = false,
  onClose,
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [chatSources, setChatSources] = useState([])
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
        const [historyRes, sourcesRes] = await Promise.all([
          loadHistory(chatId),
          getChatSources(chatId).catch(() => ({ sources: [] })),
        ])
        if (!cancelled) {
          setData(historyRes)
          setChatSources(sourcesRes?.sources || [])
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.detail || e.message || 'Laden mislukt')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [chatId, loadHistory, getChatSources])

  useEffect(() => {
    setOpenIds(new Set())
  }, [chatId])

  const handleSaveSources = useCallback(
    async (historyId, sourceIds) => {
      const res = await correctQueryHistorySources(chatId, historyId, sourceIds)
      const updated = res?.history
      if (updated) {
        setData((prev) => (prev ? mergeHistoryRow(prev, updated) : prev))
      }
    },
    [chatId, correctQueryHistorySources],
  )

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
                Open een vraag om het antwoord te bekijken en bronnen te corrigeren.
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
                        chatSources={chatSources}
                        canWrite={canWrite}
                        onSaveSources={handleSaveSources}
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
                        chatSources={chatSources}
                        canWrite={canWrite}
                        onSaveSources={handleSaveSources}
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
