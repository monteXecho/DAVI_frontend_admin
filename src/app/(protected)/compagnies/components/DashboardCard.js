export default function DashboardCard({ number, label, icon, subtitle, unlimitedCount }) {
  // Format number with exact value and proper locale formatting
  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    // Use Dutch locale formatting with dots as thousand separators
    return num.toLocaleString('nl-NL');
  };

  const formattedNumber = formatNumber(number);
  const numberLength = String(formattedNumber).length;
  
  // Dynamic font size based on number length to prevent overflow
  const getNumberFontSize = () => {
    if (numberLength <= 3) return 'text-5xl sm:text-6xl lg:text-7xl';
    if (numberLength <= 5) return 'text-4xl sm:text-5xl lg:text-6xl';
    if (numberLength <= 7) return 'text-3xl sm:text-4xl lg:text-5xl';
    return 'text-2xl sm:text-3xl lg:text-4xl';
  };

  return (
    <div className="group relative flex flex-col bg-gradient-to-br from-[#D6F5EB] to-[#E8F5E9] rounded-xl p-6 sm:p-7 lg:p-8 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] w-full h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#C8E6D9]/50 overflow-hidden">
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#23BD92]/0 to-[#23BD92]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      
      {/* Icon - positioned in top-right, larger and more prominent */}
      {icon && (
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-white/50 rounded-xl backdrop-blur-sm group-hover:bg-white/80 transition-all duration-300 p-2">
            {icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between relative z-10">
        {/* Number */}
        <div className={`font-montserrat font-bold ${getNumberFontSize()} leading-none text-[#23BD92] mb-3 sm:mb-4 break-words`}>
          {formattedNumber}
        </div>

        {/* Label and additional info */}
        <div className="space-y-2">
          <div className="font-montserrat font-bold text-sm sm:text-base lg:text-lg leading-tight text-gray-900 pr-12">
            {unlimitedCount !== undefined && unlimitedCount > 0 && (
              <span className="text-[#1B5E20] font-semibold">{unlimitedCount} </span>
            )}
            {label}
            {unlimitedCount !== undefined && unlimitedCount > 0 && (
              <span className="text-[#1B5E20] font-semibold"> onbeperkt</span>
            )}
          </div>

          {/* Subtitle (online users) */}
          {subtitle && (
            <div className="flex items-center gap-2 font-montserrat text-xs sm:text-sm text-gray-700">
              {subtitle.icon && (
                <span className="flex items-center text-[#23BD92]">
                  {subtitle.icon}
                </span>
              )}
              <span className="font-medium">{subtitle.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#23BD92] via-[#23BD92]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
