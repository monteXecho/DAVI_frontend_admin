import { X, Users } from "lucide-react"

export default function TeamlidNewEmailModal({
  email,
  onConfirmTeamlidOnly,
  onChooseOtherRoleFirst,
  onClose,
  loading = false,
}) {
  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={loading ? undefined : onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="teamlid-new-email-title"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-40"
          aria-label="Sluiten"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-start gap-3 pr-8 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#23BD92]/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#23BD92]" />
          </div>
          <div>
            <h3
              id="teamlid-new-email-title"
              className="text-xl font-bold font-montserrat text-gray-900"
            >
              Nieuw e-mailadres
            </h3>
            <p className="mt-1 text-sm text-gray-600 font-montserrat">
              Dit adres staat nog niet in uw organisatie.
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-700 font-montserrat leading-relaxed mb-4">
          Voor{" "}
          <span className="font-semibold text-gray-900 break-all">{email}</span>{" "}
          bestaat nog geen gebruikers- of beheerdersaccount. Kies hoe u deze persoon wilt toevoegen:
        </p>

        <div className="space-y-3 mb-6">
          <div className="rounded-xl border border-[#23BD92]/30 bg-[#F9FBFA] px-4 py-3 text-sm font-montserrat text-gray-800 leading-relaxed">
            <span className="font-semibold text-[#23BD92]">Alleen Teamlid</span>
            <br />
            De persoon krijgt uitsluitend teamlid-toegang tot uw werkruimte — geen eigen
            DocumentenChat-rol en geen beheerdersaccount. Na registratie logt zij of hij direct in
            als teamlid.
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-montserrat text-gray-800 leading-relaxed">
            <span className="font-semibold text-gray-900">Eerst Beheerder of gebruiker</span>
            <br />
            Voeg de persoon eerst toe als beheerder of als gewone gebruiker met een documentrol.
            Daarna kunt u onder <span className="font-semibold">Wijzigen</span> ook teamlid-rechten
            toewijzen (eventueel naast de eigen rol).
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onChooseOtherRoleFirst}
            className="px-5 py-2.5 rounded-xl border border-gray-300 font-montserrat font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Eerst andere rol kiezen
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirmTeamlidOnly}
            className="px-5 py-2.5 rounded-xl bg-[#23BD92] hover:bg-[#1ea87a] text-white font-montserrat font-semibold disabled:opacity-50"
          >
            {loading ? "Bezig…" : "Alleen Teamlid aanmaken"}
          </button>
        </div>
      </div>
    </div>
  )
}
