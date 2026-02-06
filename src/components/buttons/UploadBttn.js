export default function UploadBttn ({onClick, text, disabled = false}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-fit bg-[#23BD92] rounded-lg flex items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[18px] text-white hover:bg-[#1ea87c] transition-colors ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            >
            <svg width="24" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                d="M19.479 7.092C19.267 3.141 16.006 0 12 0C7.995 0 4.733 3.141 4.521 7.092C1.951 7.555 0 9.798 0 12.5C0 15.537 2.463 18 5.5 18H18.5C21.537 18 24 15.537 24 12.5C24 9.798 22.049 7.555 19.479 7.092ZM12 6L16 10H13V14H11V10H8L12 6Z"
                fill="white"
                />
            </svg>
            <span>{text}</span>
        </button>
    )
}
