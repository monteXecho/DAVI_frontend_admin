export default function AddCompany ({ onClose }) {
    return (
        <div className="w-full h-fit flex flex-col gap-5 p-7 rounded-2xl border border-none">
            <span className="text-2xl font-bold text-[#020003]">Add Company</span>
            <span className="text-md text-[#697A8E]">Register a new organization (tenant). You can assign modules and a primary admin now or later.</span>
            <div className="flex flex-col gap-3">
                <span className="text-xl font-bold text-[#020003]">Company name *</span>
                <input
                    type="text"
                    placeholder="e.g., Parkview Childcare BV"
                    className="w-full h-12 placeholder-[#697A8E] placeholder-opacity-100 rounded-[8px] border border-[#D9D9D9] px-4 py-3 focus:outline-none"
                />
            </div>
            <div className="flex gap-3 justify-end">
                <button 
                    className="w-fit px-7 py-3 border-1 border-zinc-100 bg-[#ffffff] rounded-full text-[#020003] shadow-md shadow-zinc-300/50 cursor-pointer transition-colors duration-200"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button className="w-fit px-7 py-3 bg-[#0E1629] rounded-full text-white cursor-pointer">
                    Create
                </button>
            </div>
        </div>
    )
}
