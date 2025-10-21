'use client'
import Image from "next/image"

export default function MenuButton({ text, image, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full h-[52px]
        rounded-[8px]
        flex justify-start items-center gap-4
        font-montserrat font-medium text-[16px] leading-[20px] text-black px-4 py-[15px]
        ${isActive ? 'bg-[#D6F5EB]' : 'bg-[#F9FBFA]'}
      `}
    >
      <Image 
        src={image} 
        alt="photo" 
        width={32}
        height={32}
        className="w-[32px] h-[32px] object-contain"
      />
      <span>
        {text}
      </span>
    </button>
  )
}
