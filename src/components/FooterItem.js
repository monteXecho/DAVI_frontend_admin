'use client'
import Image from "next/image"

export default function FooterItem ({ text, isActive, onClick, image, width, height, gap }) {
  return (
    <div className={`flex flex-col items-center gap-[${gap}] cursor-pointer`} onClick={onClick}>
      <div className="relative" style={{ width, height }}>
        <Image src={image} alt="photo" className="w-full h-full object-cover" />
        <div className={`absolute inset-0 ${isActive && 'bg-[#23BD92] mix-blend-overlay'}`}></div>
      </div>
      <div className={`font-montserrat font-semibold text-base text-center leading-5 ${isActive ? 'text-[#23BD92]' : 'text-black'}`}>
        {text}
      </div>
    </div>
  )
}