import Toggle from "@/components/buttons/Toggle";

export default function SectionWithToggle({ Name, ID, checked, onChange }) {
  return (
    <div className="w-full h-fit flex flex-col px-4 py-2 border-2 border-zinc-100 rounded-2xl shadow-sm shadow-zinc-300/50 transition-colors duration-200">
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-zinc-500">{Name}</span>
        <Toggle checked={checked} onChange={onChange} activeColor="#0E1629" />
      </div>

      <span className="text-md text-zinc-300 mr-8">{ID}</span>
    </div>
  );
}
