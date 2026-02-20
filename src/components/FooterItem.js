'use client'
import Image from "next/image"

export default function FooterItem ({ text, textLines, isActive, onClick, image, iconComponent, isLogout = false }) {
  // Use textLines if provided, otherwise fall back to text
  const displayLines = textLines || (text ? [text] : [])
  
  // Standardized sizes - all menu items same size, logout smaller
  const iconSize = isLogout ? 'w-7 h-7' : 'w-10 h-10'
  const textSize = isLogout ? 'text-xs' : 'text-sm'
  const gapSize = 'gap-2'
  
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center focus:outline-none"
      style={{ gap: '8px' }}
      aria-label={displayLines.join(' ') || text}
    >
      {/* Icon container - standardized size */}
      <div className={`relative ${iconSize} flex items-center justify-center shrink-0`}>
        {iconComponent ? (
          // Render SVG icon component with active state - green overlay
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center">
              {typeof iconComponent === 'function' ? iconComponent() : iconComponent}
            </div>
            {isActive && (
              <div className="absolute inset-0 bg-[#23BD92] mix-blend-overlay"></div>
            )}
          </div>
        ) : image ? (
          // Render image with active state overlay - green overlay only
          <div className="relative w-full h-full flex items-center justify-center">
            <Image 
              src={image} 
              alt={displayLines.join(' ') || text} 
              className="w-full h-full object-contain"
              width={40}
              height={40}
            />
            {isActive && (
              <div className="absolute inset-0 bg-[#23BD92] mix-blend-overlay"></div>
            )}
          </div>
        ) : null}
      </div>
      
      {/* Text - standardized size and styling */}
      <div className={`
        font-montserrat font-medium ${textSize} text-center leading-tight
        transition-colors duration-200
        ${isActive ? 'text-[#23BD92]' : 'text-gray-700'}
      `}>
        {displayLines.map((line, index) => (
          <div key={index} className="block whitespace-nowrap">
            {line}
          </div>
        ))}
      </div>
    </button>
  )
}