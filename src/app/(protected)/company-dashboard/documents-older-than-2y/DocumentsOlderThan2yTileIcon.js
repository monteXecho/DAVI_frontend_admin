/**
 * Document glyph (same artwork as Dashboard DocumentIcon) + “2y” — sized to match
 * DashboardCard icon tiles (w-12 → lg:w-16 box).
 */
export default function DocumentsOlderThan2yTileIcon() {
  return (
    <div
      className="flex shrink-0 flex-row items-end gap-0.5 sm:gap-1"
      aria-hidden
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/50 p-2 opacity-70 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/80 group-hover:opacity-100 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
        <svg
          className="h-full w-full"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
            stroke="#23BD92"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#D6F5EB"
          />
          <path
            d="M14 2V8H20"
            stroke="#23BD92"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 13H8"
            stroke="#23BD92"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 17H8"
            stroke="#23BD92"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 9H9H8"
            stroke="#23BD92"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {/* Cap height = half of icon box: 48→24px, 56→28px, 64→32px */}
      <span className="inline-flex shrink-0 items-end font-montserrat text-[24px] font-bold leading-[24px] tracking-tight text-[#23BD92] sm:text-[28px] sm:leading-[28px] lg:text-[32px] lg:leading-[32px]">
        2y
      </span>
    </div>
  );
}
