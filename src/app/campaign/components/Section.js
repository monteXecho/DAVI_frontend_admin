'use client'

export default function Section({ Name, ID, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`w-full h-fit flex flex-col px-4 py-2 rounded-2xl shadow-sm shadow-zinc-300/50 cursor-pointer transition-colors duration-200
        ${selected ? "border-2 border-[#aeaeae]" : "border-2 border-zinc-100"}`}
    >
      <span className="text-xl font-bold text-zinc-500">{Name}</span>
      <span className="text-md text-zinc-300">{ID}</span>
    </div>
  );
}
