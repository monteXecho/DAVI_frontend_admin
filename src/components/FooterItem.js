'use client'
import Image from "next/image"

export default function FooterItem ({ text, isActive, onClick, image, iconComponent, width, height, gap }) {
  // Convert gap string to pixels (e.g., '2' -> '8px', '3' -> '12px')
  const gapPx = gap && !isNaN(gap) ? `${parseInt(gap) * 4}px` : (gap?.includes('px') ? gap : '8px')
  
  return (
    <div className="flex flex-col items-center cursor-pointer" style={{ gap: gapPx }} onClick={onClick}>
      <div className="relative flex items-center justify-center" style={{ width, height }}>
        {iconComponent ? (
          // Render SVG icon component
          <div className={`w-full h-full flex items-center justify-center ${isActive ? 'text-[#23BD92]' : 'text-gray-700'}`}>
            {typeof iconComponent === 'function' ? iconComponent() : iconComponent}
          </div>
        ) : image ? (
          // Render image
          <>
            <Image src={image} alt={text} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 ${isActive && 'bg-[#23BD92] mix-blend-overlay'}`}></div>
          </>
        ) : null}
      </div>
      <div className={`font-montserrat font-semibold text-base text-center leading-5 ${isActive ? 'text-[#23BD92]' : 'text-black'}`}>
        {text}
      </div>
    </div>
  )
}