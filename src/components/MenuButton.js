'use client'

export default function MenuButton({ text, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full h-full
        rounded-[8px]
        flex justify-start items-center
        font-montserrat font-medium text-[16px] leading-[20px] text-black px-4 py-[15px]
        ${isActive ? 'bg-[#D6F5EB]' : 'bg-[#F9FBFA]'}
      `}
    >
      <span>
        {text}
      </span>
    </button>
  )
}
