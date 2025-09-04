'use client'

export default function Toggle({ 
  checked = false, 
  onChange, 
  activeColor = "#23BD92"
}) {
  const toggleSwitch = () => {
    if (onChange) onChange(!checked); // controlled: rely on parent state
  };

  return (
    <button
      onClick={toggleSwitch}
      className="relative w-10 h-6 rounded-full border box-border transition-colors duration-200"
      style={{
        backgroundColor: checked ? activeColor : "white",
        borderColor: activeColor,
      }}
    >
      <span
        className="absolute w-[18px] h-[18px] rounded-full top-1/2 -translate-y-1/2 transition-all duration-200"
        style={{
          left: checked ? "19px" : "3px",
          backgroundColor: checked ? "white" : activeColor,
        }}
      />
    </button>
  );
}
