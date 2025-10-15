'use client'
import { useState, useEffect } from "react";
import SectionWithToggle from "./SectionWithToggle";

export default function AssignModules({ modules, onAssign }) {
  const [localModules, setLocalModules] = useState([]);

  console.log('____SELECTED MODULE___', modules)

  useEffect(() => {
    // Ensure modules always have a desc field
    const withDesc = (modules || []).map(m => ({
      ...m,
      desc: m.desc ?? m.name // fallback if desc not provided
    }));
    setLocalModules(withDesc);
  }, [modules]);

  const toggleModule = (index, newValue) => {
    setLocalModules(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], enabled: newValue };
      return updated;
    });
  };

  const handleSave = () => {
    console.log("Saving modules:", localModules);
    if(onAssign) onAssign(localModules)
  };

  return (
    <div className="w-full h-2/3 min-h-fit flex flex-col justify-between p-5 gap-5 border border-zinc-100 rounded-2xl shadow-lg shadow-zinc-300/50">
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
      <div className="flex justify-end">
        <button
          className="xl:w-fit w-full px-7 py-3 bg-[#0E1629] rounded-full text-white"
          onClick={handleSave}
        >
          Opslaan
        </button>
      </div>
    </div>
  );
}
