'use client'
import Image from "next/image"

export default function MenuButton({ text, image, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full h-[52px]
        rounded-lg
        flex justify-start items-center gap-4
        font-montserrat font-medium text-[16px] leading-5 text-black px-4 py-[15px]
        ${isActive ? 'bg-[#D6F5EB]' : 'bg-[#F9FBFA]'}
      `}
    >
      <div className="w-8 h-8 flex items-center justify-center">
        {typeof image === 'function' ? (
          image()
        ) : (
          <Image 
            src={image} 
            alt="icon" 
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
        )}
      </div>
      <span>
        {text}
      </span>
    </button>
  )
}