import { X } from "lucide-react";

export default function DeleteUserModal({ users, onConfirm, onClose, isMultiple }) {
  const singleUser = !isMultiple && users?.[0];
  
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

      {isMultiple ? (
        <div className="text-center text-[18px] leading-6 text-black px-6">
          <p className="mb-4">
            Weet je zeker dat je <br />
            <span className="font-semibold">{users.length} gebruikers</span>
            <br />
            wil verwijderen?
          </p>
          <div className="max-h-20 overflow-y-auto text-sm mt-2">
            {users.slice(0, 5).map((user, index) => (
              <div key={user.id} className="truncate">
                • {user.Naam} ({user.Email})
              </div>
            ))}
            {users.length > 5 && (
              <div className="text-gray-500">
                ... en {users.length - 5} meer
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-[18px] leading-6 text-black px-6">
          Weet je zeker dat je <br />
          <span className="font-semibold">{singleUser?.Naam}</span> / <br />
          <span className="font-semibold">{singleUser?.Email}</span>
          <br />
          wil verwijderen?
        </p>
      )}

      <button
        onClick={onConfirm}
        className="bg-[#E94F4F] hover:bg-red-600 text-white font-bold text-base rounded-lg w-fit h-fit px-4 py-2 flex items-center justify-center"
      >
        {isMultiple ? `Verwijder ${users.length} gebruikers` : 'Verwijder gebruiker'}
      </button>
    </div>
  );
}