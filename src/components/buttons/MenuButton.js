'use client'
import Image from "next/image"

export default function MenuButton({ text, image, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full h-[50px]
        rounded-[8px]
        flex justify-start items-center gap-4
        font-montserrat font-medium text-[16px] leading-[20px] text-black px-4 py-[15px]
        ${isActive ? 'bg-[#D6F5EB]' : 'bg-[#F9FBFA]'}
      `}
    >
      <Image src={image} alt="photo" className="w-[30px] h-[32px] object-cover" />
      <span>
        {text}
      </span>
    </button>
  )
}
