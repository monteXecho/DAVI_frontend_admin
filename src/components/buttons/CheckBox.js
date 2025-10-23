export default function CheckBox({ toggle, color, onChange, indeterminate = false }) {
    return (
        <div className="inline-flex items-center">
            <label className="flex items-center relative cursor-pointer">
                <input
                    type="checkbox"
                    checked={toggle}
                    onChange={(e) => onChange?.(e.target.checked)}
                    style={{ '--check-color': color }}
                    className="peer h-4 w-4 transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-[var(--check-color)] checked:border-[var(--check-color)]"
                    ref={(el) => {
                        if (el) {
                            el.indeterminate = indeterminate;
                        }
                    }}
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </span>
            </label>
        </div>
    );
}