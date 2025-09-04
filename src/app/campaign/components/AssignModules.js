'use client'
import { useState, useEffect } from "react";
import SectionWithToggle from "./SectionWithToggle";

export default function AssignModules({ modules }) {
  const [localModules, setLocalModules] = useState(modules);

  // Reset when company changes
  useEffect(() => {
    setLocalModules(modules);
  }, [modules]);

  const toggleModule = (index, newValue) => {
    const updated = [...localModules];
    updated[index].enabled = newValue;
    setLocalModules(updated);
  };

  return (
    <div className="w-full h-2/3 min-h-fit flex flex-col p-5 gap-5 border-1 border-zinc-100 rounded-2xl shadow-lg shadow-zinc-300/50">
      <div className="flex flex-col gap-3">
        <span className="text-lg font-bold text-zinc-500">3) Modules toewijzen</span>
        {localModules.map((item, index) => (
          <SectionWithToggle
            key={item.name}
            Name={item.name}
            ID={item.desc}
            checked={item.enabled}
            onChange={(val) => toggleModule(index, val)}
          />
        ))}
      </div>
      <button className="w-fit px-7 py-3 bg-[#0E1629] rounded-full text-white">
        Opslaan
      </button>
    </div>
  );
}
