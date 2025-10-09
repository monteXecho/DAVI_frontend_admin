import { X } from "lucide-react";

export default function DeleteUserModal ({ name, email, onConfirm, onClose }) {
  return (
    <div className="relative w-[350px] h-[350px] bg-white shadow-md rounded-2xl flex flex-col items-center justify-center gap-10">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      <div className="w-12 h-12 rounded-full bg-[#E94F4F] flex items-center justify-center">
        <span className="text-white text-3xl leading-none">×</span>
      </div>

      <p className="text-center text-[18px] leading-6 text-black px-6">
        Weet je zeker dat je <br />
        <span className="font-semibold">{name}</span> / <br />
        <span className="font-semibold">{email}</span>
        <br />
        wil verwijderen?
      </p>

      <button
        onClick={onConfirm}
        className="bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg w-[196px] h-10 flex items-center justify-center"
      >
        Verwijder gebruiker
      </button>
    </div>
  );
}