import { X, AlertCircle, Globe, Clock, Shield } from "lucide-react"

export default function UrlErrorModal({
  error,
  url,
  onClose,
}) {
  // Parse error message to determine error type and provide helpful information
  const getErrorInfo = () => {
    if (!error) {
      return {
        title: "Fout bij het ophalen van URL",
        icon: AlertCircle,
        iconColor: "text-red-500",
        message: "Er is een onbekende fout opgetreden.",
        suggestions: []
      }
    }

    const errorMessage = error.message || error.detail || String(error)
    const lowerError = errorMessage.toLowerCase()

    // 403 Forbidden - Website blocking automated requests
    if (lowerError.includes("403") || lowerError.includes("forbidden") || lowerError.includes("access denied")) {
      return {
        title: "Website blokkeert automatische toegang",
        icon: Shield,
        iconColor: "text-orange-500",
        message: "Deze website heeft beveiligingsmaatregelen die automatische verzoeken blokkeren.",
        suggestions: [
          "Probeer de URL eerst handmatig in een browser te openen",
          "Sommige websites vereisen een eerste bezoek voordat ze toegankelijk zijn",
          "Neem contact op met de websitebeheerder voor API-toegang",
          "Overweeg om de HTML-inhoud handmatig te uploaden als alternatief"
        ],
        type: "blocked"
      }
    }

    // Timeout errors
    if (lowerError.includes("timeout") || lowerError.includes("too long")) {
      return {
        title: "Website reageert te langzaam",
        icon: Clock,
        iconColor: "text-yellow-500",
        message: "De website heeft te lang nodig om te reageren.",
        suggestions: [
          "Controleer of de URL correct is en toegankelijk",
          "Probeer het later opnieuw - de website kan tijdelijk overbelast zijn",
          "Controleer uw internetverbinding"
        ],
        type: "timeout"
      }
    }

    // Connection errors
    if (lowerError.includes("connection") || lowerError.includes("disconnected") || lowerError.includes("server disconnected")) {
      return {
        title: "Verbindingsprobleem",
        icon: Globe,
        iconColor: "text-blue-500",
        message: "Er kon geen verbinding worden gemaakt met de website.",
        suggestions: [
          "Controleer of de URL correct is gespeld",
          "Controleer uw internetverbinding",
          "Probeer de URL handmatig in een browser te openen",
          "De website kan tijdelijk niet beschikbaar zijn"
        ],
        type: "connection"
      }
    }

    // 404 Not Found
    if (lowerError.includes("404") || lowerError.includes("not found")) {
      return {
        title: "URL niet gevonden",
        icon: AlertCircle,
        iconColor: "text-red-500",
        message: "De opgegeven URL bestaat niet of is niet meer beschikbaar.",
        suggestions: [
          "Controleer of de URL correct is gespeld",
          "Probeer de URL handmatig in een browser te openen",
          "De pagina kan zijn verwijderd of verplaatst"
        ],
        type: "not_found"
      }
    }

    // Generic error
    return {
      title: "Fout bij het ophalen van URL",
      icon: AlertCircle,
      iconColor: "text-red-500",
      message: errorMessage,
      suggestions: [
        "Controleer of de URL correct is",
        "Probeer het later opnieuw",
        "Neem contact op met ondersteuning als het probleem aanhoudt"
      ],
      type: "generic"
    }
  }

  const errorInfo = getErrorInfo()
  const IconComponent = errorInfo.icon

  return (
    <div className="relative w-fit h-fit py-8 px-12 bg-white shadow-xl rounded-2xl flex flex-col items-center justify-center gap-6 min-w-[600px] max-w-[700px]">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Sluiten"
      >
        <X size={24} />
      </button>

      {/* Icon */}
      <div className={`${errorInfo.iconColor} mb-2`}>
        <IconComponent size={64} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 text-center">
        {errorInfo.title}
      </h2>

      {/* URL Display */}
      {url && (
        <div className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 font-medium">Webadres:</p>
          <p className="text-sm text-gray-700 break-all font-montserrat">{url}</p>
        </div>
      )}

      {/* Message */}
      <div className="w-full">
        <p className="text-base text-gray-700 text-center font-montserrat leading-relaxed">
          {errorInfo.message}
        </p>
      </div>

      {/* Suggestions */}
      {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
        <div className="w-full bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-3 font-montserrat">
            Wat kunt u proberen?
          </p>
          <ul className="space-y-2">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1.5 flex-shrink-0">•</span>
                <span className="text-sm text-blue-800 font-montserrat leading-relaxed">
                  {suggestion}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="bg-[#23BD92] hover:bg-[#1ea87c] text-white font-bold text-base rounded-lg w-full h-12 flex items-center justify-center transition-colors mt-2"
      >
        Begrijpen
      </button>
    </div>
  )
}

