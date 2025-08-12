import { useState } from "react";

export default function Toggle({ checked = false, onChange }) {
  const [isOn, setIsOn] = useState(checked);

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onChange) onChange(newState);
  };

  return (
    <button
      onClick={toggleSwitch}
      className={`relative w-10 h-6 rounded-full border box-border transition-colors duration-200
        ${isOn ? "bg-[#23BD92] border-[#23BD92]" : "bg-white border-[#23BD92]"}`}
    >
      <span
        className={`absolute w-[18px] h-[18px] rounded-full top-1/2 -translate-y-1/2 transition-all duration-200
          ${isOn ? "left-[19px] bg-white" : "left-[3px] bg-[#23BD92]"}`}
      />
    </button>
  );
}
