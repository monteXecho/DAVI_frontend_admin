'use client';

import DocumentsOlderThan2yTileIcon from './DocumentsOlderThan2yTileIcon';

function getNumberFontSize(formattedNumber) {
  const numberLength = String(formattedNumber).length;
  if (numberLength <= 3) return 'text-5xl sm:text-6xl lg:text-7xl';
  if (numberLength <= 5) return 'text-4xl sm:text-5xl lg:text-6xl';
  if (numberLength <= 7) return 'text-3xl sm:text-4xl lg:text-5xl';
  return 'text-2xl sm:text-3xl lg:text-4xl';
}

/**
 * Dashboard tile — same shell as DashboardCard; top row = number + icon + “2y” (one line, nowrap).
 */
export default function DocumentsOlderThan2yTileCard({ count, onClick }) {
  const n = typeof count === 'number' && count >= 0 ? count : 0;
  const formatted = n.toLocaleString('nl-NL');

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex min-h-[180px] w-full flex-col overflow-hidden rounded-xl border border-[#C8E6D9]/50 bg-gradient-to-br from-[#D6F5EB] to-[#E8F5E9] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-[200px] sm:p-7 lg:min-h-[220px] lg:p-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23BD92]/50 focus-visible:ring-offset-2"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#23BD92]/0 to-[#23BD92]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between">
        {/* Single row: stat | icon (DashboardCard size) | duration — matches other tiles’ scale */}
        <div className="mb-3 flex w-full min-w-0 flex-nowrap items-end gap-1 sm:mb-2 sm:gap-2">
          <div
            className={`min-w-0 shrink font-montserrat font-bold leading-none tracking-tight text-[#23BD92] break-words ${getNumberFontSize(formatted)}`}
          >
            {formatted}
          </div>
          <DocumentsOlderThan2yTileIcon />
        </div>

        <div className="pr-1 font-montserrat text-sm font-bold leading-tight text-gray-900 sm:text-base lg:text-lg">
          <span className="block">Documenten ouder</span>
          <span className="block">dan 2 jaar</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#23BD92] via-[#23BD92]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}
