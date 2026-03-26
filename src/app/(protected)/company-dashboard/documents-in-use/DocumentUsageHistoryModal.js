'use client';

import OpenDocumentCircleIcon from './OpenDocumentCircleIcon';

function formatNlDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatPath(ev) {
  const fn = ev.file_name || '';
  const folder = (ev.folder_name || '').trim();
  if (folder) return `${folder} / ${fn}`;
  return fn || '—';
}

export default function DocumentUsageHistoryModal({
  open,
  onClose,
  fileName,
  events,
  loading,
  onOpenFile,
  filePath,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-history-title"
      >
        <div className="relative px-6 pt-8 pb-4 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23BD92]"
            aria-label="Sluiten"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="flex justify-center mb-3">
            <OpenDocumentCircleIcon className="w-12 h-12" />
          </div>
          <h2
            id="doc-history-title"
            className="text-center font-montserrat font-bold text-base sm:text-lg text-[#342222] px-4"
          >
            Documentgeschiedenis voor <span className="font-extrabold">{fileName || '—'}</span>
          </h2>
          <p className="text-center text-xs text-gray-500 font-montserrat mt-2">
            Gebruik voor gegenereerde antwoorden (DocumentenChat)
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-b-[#23BD92] border-gray-200" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-gray-500 font-montserrat py-8">
              Nog geen antwoorden gegenereerd met dit document.
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 pr-2 font-montserrat text-sm font-semibold text-[#342222] w-[20%]">
                    Actie
                  </th>
                  <th className="py-2 pr-2 font-montserrat text-sm font-semibold text-[#342222] w-[22%]">
                    Datum en tijd
                  </th>
                  <th className="py-2 pr-2 font-montserrat text-sm font-semibold text-[#342222] w-[22%]">
                    Gevraagd door
                  </th>
                  <th className="py-2 font-montserrat text-sm font-semibold text-[#342222]">
                    Locatie
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, idx) => (
                  <tr key={`${ev.at}-${idx}`} className="border-b border-gray-100">
                    <td className="py-3 pr-2 font-montserrat text-sm font-bold text-[#342222] align-top">
                      {ev.action || 'Antwoord gegenereerd'}
                    </td>
                    <td className="py-3 pr-2 font-montserrat text-sm text-[#342222] align-top">
                      {formatNlDateTime(ev.at)}
                    </td>
                    <td className="py-3 pr-2 font-montserrat text-sm text-[#342222] align-top break-all">
                      {ev.asker_email || '—'}
                    </td>
                    <td className="py-3 font-montserrat text-sm text-[#342222] align-top break-all">
                      {formatPath(ev)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex flex-wrap gap-3 justify-end">
          {filePath ? (
            <button
              type="button"
              onClick={onOpenFile}
              className="px-4 py-2 rounded-lg border border-[#4C9AFF] text-[#4C9AFF] text-sm font-montserrat font-semibold hover:bg-[#4C9AFF]/10"
            >
              Open bestand in nieuw tabblad
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#23BD92] text-white text-sm font-montserrat font-semibold hover:opacity-90"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
