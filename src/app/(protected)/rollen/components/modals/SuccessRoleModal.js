export default function SuccessRoleModal({ roleName, onClose }) {
  return (
    <div className="relative w-[350px] h-[350px] bg-white shadow-md rounded-2xl flex flex-col items-center justify-center gap-10">
      {/* Success Icon */}
      <div className="w-12 h-12 flex items-center justify-center">
        <svg width="45" height="48" viewBox="0 0 45 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.4011 0C34.7623 0 44.8 10.7547 44.8 23.9988C44.8 37.2453 34.7623 48 22.4011 48C10.0377 48 0 37.2453 0 23.9988C0 10.7547 10.0377 0 22.4011 0ZM11.0885 24.9326L19.7169 33.1667C20.0351 33.474 20.4361 33.6228 20.835 33.6228C21.2876 33.6228 21.7424 33.4284 22.0718 33.0419L35.4098 17.4164C35.7033 17.0731 35.849 16.641 35.849 16.2113C35.849 15.227 35.1073 14.418 34.173 14.418C33.716 14.418 33.2656 14.6149 32.9318 15.0013L20.714 29.3137L13.3246 22.2608C13.002 21.9559 12.6054 21.8047 12.2066 21.8047C11.2767 21.8047 10.5306 22.6089 10.5306 23.5955C10.5306 24.0876 10.7188 24.5773 11.0885 24.9326Z" fill="#23BD92"/>
        </svg>
      </div>

      {/* Success Message */}
      <p className="text-center text-[18px] leading-6 text-black px-6">
        De rol<br />
        <span className="font-semibold">{roleName}</span>
        <br />
        is succesvol aangemaakt!
      </p>

      {/* OK Button */}
      <button
        onClick={onClose}
        className="bg-[#23BD92] hover:bg-[#1ea87e] text-white font-bold text-base rounded-lg w-fit h-fit px-4 py-2 flex items-center justify-center"
      >
        OK
      </button>
    </div>
  )
}
