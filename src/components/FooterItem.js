'use client'
import Image from "next/image"

export default function FooterItem ({ text, isActive, onClick, image, width, height, gap }) {
  return (
    <div className={`flex flex-col gap-[${gap}] cursor-pointer`} onClick={onClick}>
      <div className="relative" style={{ width, height }}>
        <Image src={image} alt="photo" className="w-full h-full object-cover" />
        <div className={`absolute inset-0 ${isActive && 'bg-[#23BD92] mix-blend-overlay'}`}></div>
      </div>
      <div className={`font-montserrat font-semibold text-base leading-5 ${isActive ? 'text-[#23BD92]' : 'text-[#000]'}`}>
        {text}
      </div>
    </div>
  )
}