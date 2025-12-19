export default function AddButton ({onClick, text}) {
    return (
        <button
            onClick={onClick}
            className="min-w-[154px] w-fit h-10 bg-[#23BD92] rounded-lg flex items-center gap-2.5 px-[13px] py-[15px] font-montserrat font-bold text-[18px] text-white"
            >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.002 0C15.52 0 20 4.48 20 9.998C20 15.515 15.52 19.995 10.002 19.995C4.485 19.995 0.00500488 15.515 0.00500488 9.998C0.00500488 4.48 4.485 0 10.002 0ZM9.255 9.25H5.755C5.341 9.25 5.005 9.586 5.005 10C5.005 10.414 5.341 10.75 5.755 10.75H9.255V14.25C9.255 14.664 9.59101 15 10.005 15C10.419 15 10.755 14.664 10.755 14.25V10.75H14.255C14.669 10.75 15.005 10.414 15.005 10C15.005 9.586 14.669 9.25 14.255 9.25H10.755V5.75C10.755 5.336 10.419 5 10.005 5C9.59101 5 9.255 5.336 9.255 5.75V9.25Z" fill="white"/>
            </svg>
            <span>{text}</span>
        </button>
    )
}
