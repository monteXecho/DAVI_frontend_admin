'use client';

import LastUserActivityIcon from './LastUserActivityIcon';

/**
 * Tile — Laatste gebruikersactiviteit (no stat number; copy + icon like brief).
 */
export default function LastUserActivityTileCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex min-h-[180px] w-full flex-col overflow-hidden rounded-xl border border-[#C8E6D9]/50 bg-gradient-to-br from-[#D6F5EB] to-[#E8F5E9] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23BD92]/50 focus-visible:ring-offset-2 sm:min-h-[200px] sm:p-7 lg:min-h-[220px] lg:p-8"
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-[#23BD92]/0 to-[#23BD92]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute bottom-4 right-4 z-10 opacity-80 transition-all duration-300 group-hover:opacity-100 sm:bottom-5 sm:right-5 group-hover:scale-105">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/50 p-2 backdrop-blur-sm transition-all group-hover:bg-white/80 sm:h-14 sm:w-14">
          <LastUserActivityIcon className="h-9 w-8 sm:h-10 sm:w-9" />
        </div>
      </div>

      <div className="relative z-10 flex max-w-[85%] flex-col pr-2 pb-2">
        <p className="font-montserrat text-sm font-bold leading-tight text-gray-900 sm:text-base">
          Laatste gebruikersactiviteit
        </p>
        <p className="mt-3 font-montserrat text-sm font-bold leading-snug text-[#23BD92] sm:text-base lg:text-lg">
          Uploads, wijzigingen en verwijderingen
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#23BD92] via-[#23BD92]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}
