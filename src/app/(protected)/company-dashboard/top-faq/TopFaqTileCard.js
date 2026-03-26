'use client';

import TopFaqIcon from './TopFaqIcon';

/**
 * 5th dashboard tile — top question this month (preview) + teal question text.
 */
export default function TopFaqTileCard({
  topQuestion,
  count,
  loading = false,
  onClick,
}) {
  const q = (topQuestion || '').trim();
  const showCount = typeof count === 'number' && count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col bg-gradient-to-br from-[#D6F5EB] to-[#E8F5E9] rounded-xl p-6 sm:p-7 lg:p-8 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] w-full h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#C8E6D9]/50 overflow-hidden text-left outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23BD92]/50 focus-visible:ring-offset-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#23BD92]/0 to-[#23BD92]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
      <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 opacity-70 group-hover:opacity-100 transition-opacity group-hover:scale-110 pointer-events-none">
        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white/50 rounded-xl backdrop-blur-sm group-hover:bg-white/80 transition-all p-2">
          <TopFaqIcon className="w-9 h-9 sm:w-10 sm:h-10" />
        </div>
      </div>

      <div className="pr-2 sm:pr-3 pb-6 flex flex-col flex-1 min-h-0 relative z-10">
        <p className="font-montserrat font-bold text-sm sm:text-base leading-tight text-gray-900">
          Meest gestelde vraag deze maand
        </p>

        {loading ? (
          <div className="mt-4 flex justify-start">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-b-[#23BD92] border-gray-200" />
          </div>
        ) : (
          <>
            <p className="mt-3 sm:mt-4 font-montserrat font-bold text-lg sm:text-xl lg:text-2xl leading-snug text-[#23BD92] line-clamp-4 break-words">
              {q || '—'}
            </p>
          </>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#23BD92] via-[#23BD92]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </button>
  );
}
