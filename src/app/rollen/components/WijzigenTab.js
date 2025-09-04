'use client'
import { useMemo, useState } from "react";
import Toggle from "@/components/buttons/Toggle";
import DropdownMenu from "@/components/input/DropdownMenu";
import AddIcon from "@/components/icons/AddIcon";
import RedCancelIcon from "@/components/icons/RedCancelIcon";

export default function WijzigenTab() {
  const allOptions = ["Staff", "Option 1", "Option 2", "Option 3"];
  const [selected, setSelected] = useState(allOptions[0]);

  // modules state
  const initialModules = [
    { name: "Documentenchat", enabled: true },
    { name: "Vaste gezichten criterium", enabled: false },
    { name: "3-uursregeling check", enabled: true },
    { name: "BKR check", enabled: false },
  ];
  const [modules, setModules] = useState(initialModules);

  // master toggle = true only if all modules are enabled
  const allEnabled = useMemo(() => modules.every((m) => m.enabled), [modules]);

  const toggleAll = (val) => {
    setModules((prev) => prev.map((m) => ({ ...m, enabled: val })));
  };

  const toggleOne = (index, val) => {
    setModules((prev) =>
      prev.map((m, i) => (i === index ? { ...m, enabled: val } : m))
    );
  };

  const handleSave = () => {
    console.log("Saving role:", selected);
    console.log("Saving modules:", modules);
  };

  return (
    <div className="flex flex-col gap-11 w-full">
      <div className="flex flex-col w-full">
        <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">
          Rolnaam
        </span>
        <div className="flex gap-[14px] items-center mb-5">
          <div className="w-1/3">
            <DropdownMenu
              value={selected}
              onChange={setSelected}
              allOptions={allOptions}
            />
          </div>
          <RedCancelIcon />
        </div>

        <span className="mb-2 font-montserrat font-normal text-[16px] leading-normal tracking-normal">
          Toegang tot map/document
        </span>
        <div className="flex mb-4 gap-[14px] items-center">
          <input
            type="text"
            placeholder="//beleid"
            className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />
          <div className="flex gap-[6px]">
            <AddIcon />
            <RedCancelIcon />
          </div>
        </div>
        <div className="flex mb-4 gap-[14px] items-center">
          <input
            type="text"
            placeholder="//kwaliteit/bkr"
            className="w-1/3 h-12 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
          />
          <div className="flex gap-[6px]">
            <AddIcon />
            <RedCancelIcon />
          </div>
        </div>
      </div>

      <div className="flex flex-col w-1/3 gap-10">
        <div className="flex flex-col w-full gap-[23px]">
          <div className="flex w-full items-center justify-between">
            <span className="font-montserrat font-bold text-2xl leading-normal tracking-normal">
              AI-modules
            </span>
            <Toggle
              checked={allEnabled}
              onChange={toggleAll}
              activeColor="#23BD92"
            />
          </div>

          {modules.map((item, index) => (
            <div
              key={item.name}
              className="flex w-full items-center justify-between"
            >
              <span className="font-montserrat font-normal text-[16px] leading-normal tracking-normal">
                {item.name}
              </span>
              <Toggle
                checked={item.enabled}
                onChange={(val) => toggleOne(index, val)}
                activeColor="#23BD92"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-[95px] h-[50px] rounded-[8px] bg-[#23BD92] font-montserrat font-bold text-base leading-[100%] tracking-normal text-center text-white"
        >
          Opslaan
        </button>
      </div>
    </div>
  );
}
