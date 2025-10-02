export default function Toggle({
  label,
  checked,
  onChange,
  disabled,
  readOnly,
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        className="sr-only"
        id={label}
        name={label}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
      />
      <span
        className={`relative inline-block h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
      <span className="text-gray-800 text-sm">{label}</span>
    </label>
  );
}
