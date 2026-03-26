'use client';

/**
 * Under Construction / Maintenance page.
 * Shown when backend is unavailable or super admin has activated maintenance mode.
 * Matches DAVI design: DAVI branding, maintenance text, Contact button, construction icon.
 */
export default function UnderConstructionPage({ onContact }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-6 sm:p-8 md:p-12">
      <div className="w-full max-w-[1180px] flex flex-col md:flex-row md:items-center md:justify-between gap-12 md:gap-16">
        {/* Left: Text content */}
        <div className="flex flex-col gap-6 order-2 md:order-1">
          <h1 className="font-montserrat font-extrabold text-[64px] sm:text-[80px] md:text-[108px] leading-[1.1] text-[#23BD92] tracking-tight">
            DAVI
          </h1>
          <p className="font-montserrat font-bold text-[20px] sm:text-[22px] md:text-[24px] leading-6 text-[#342222]">
            We zijn momenteel bezig met onderhoud.
          </p>
          <p className="font-montserrat font-normal text-[18px] sm:text-[20px] leading-6 text-[#342222] -mt-2">
            Probeer het later nog eens.
          </p>
          {onContact && (
            <button
              onClick={onContact}
              className="mt-2 w-fit flex items-center justify-center px-5 py-[15px] bg-[#23BD92] rounded-lg hover:bg-[#1ea87c] transition-colors"
              aria-label="Contact"
            >
              <span className="font-montserrat font-bold text-base text-white">
                Contact
              </span>
            </button>
          )}
        </div>

        {/* Right: Construction icon in circle */}
        <div className="flex-shrink-0 order-1 md:order-2 flex items-center justify-center">
          <div
            className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[427px] md:h-[427px] rounded-full bg-[#D6F5EB] flex items-center justify-center p-8"
            aria-hidden
          >
            <ConstructionIcon className="w-full h-full max-w-[180px] max-h-[180px] sm:max-w-[220px] sm:max-h-[220px] md:max-w-[280px] md:max-h-[280px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Construction icon - DAVI design */
function ConstructionIcon({ className = '' }) {
  return (
    <svg
      width="224"
      height="224"
      viewBox="0 0 224 224"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M205.408 60.1813C202.263 53.9467 197.027 43.54 193.956 37.3333C192.743 34.8973 190.428 33.46 187.712 33.2173C174.953 32.0507 148.111 30.0533 137.041 29.3253C131.936 28.9893 128.165 29.7453 124.899 33.0307L98.896 59.164C96.5533 61.516 95.2373 64.6987 95.2467 68.012L95.2933 152.339L67.7973 175.345L42.42 147.383C36.904 141.316 26.908 143.323 24.2947 151.107C15.54 177.399 0 224 0 224H112L74.0787 182.261L130.629 134.932L146.953 121.268L128.66 154.467C127.689 156.221 127.129 158.163 126.999 160.141L123.303 216.561C123.097 219.865 125.384 224 130.648 224C134.083 224 137.06 221.639 137.835 218.297C140.719 205.949 147.401 177.24 149.091 169.969C149.352 168.849 149.903 167.832 150.677 166.992C155.801 161.476 176.232 140 176.232 140C176.232 140 202.403 202.216 209.468 219.567C210.523 222.152 212.959 224 216.449 224C220.761 224 224 220.435 224 216.505C224 215.143 207.713 136.528 202.328 107.884C201.675 104.421 200.097 101.192 197.755 98.5507L187.675 87.192L220.369 59.8267C225.101 55.86 219.091 48.7013 214.377 52.668L205.408 60.1813ZM141.437 113.708L124.637 127.773L106.419 143.024L116.321 87.5093L141.437 113.708ZM197.073 67.1533L181.477 80.2013L155.428 50.8387L180.908 49.1307L197.073 67.1533ZM88.312 0C75.712 0 65.4827 10.2293 65.4827 22.8293C65.4827 35.4293 75.712 45.6493 88.312 45.6493C100.903 45.6493 111.141 35.4293 111.141 22.8293C111.141 10.2293 100.903 0 88.312 0Z"
        fill="#23BD92"
      />
    </svg>
  );
}
