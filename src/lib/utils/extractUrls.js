const URL_WITH_SCHEME_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\],]+/gi

const TRAILING_PUNCTUATION = /[.,;:!?)]+$/g

/**
 * Normalize one URL string (add https:// when missing).
 * Returns null when invalid.
 */
export function normalizeSingleUrl(raw) {
  const trimmed = String(raw || "").trim()
  if (!trimmed) return null

  let candidate = trimmed.replace(TRAILING_PUNCTUATION, "")
  if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
    candidate = `https://${candidate}`
  }

  try {
    return new URL(candidate).href
  } catch {
    return null
  }
}

/**
 * Extract unique, valid URLs from pasted text (multiple lines, spaces, commas).
 */
export function extractUrlsFromText(text) {
  const input = String(text || "")
  if (!input.trim()) return []

  const seen = new Set()
  const urls = []

  const addUrl = (raw) => {
    const normalized = normalizeSingleUrl(raw)
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized)
      urls.push(normalized)
    }
  }

  const schemeMatches = input.match(URL_WITH_SCHEME_REGEX) || []
  for (const match of schemeMatches) {
    addUrl(match)
  }

  // Lines without explicit scheme (e.g. www.example.com/page)
  const lines = input.split(/\r?\n/)
  for (const line of lines) {
    const parts = line.split(/[,;\t|]+/)
    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed || /https?:\/\//i.test(trimmed)) continue
      if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(trimmed)) {
        addUrl(trimmed)
      }
    }
  }

  // Single URL pasted without scheme and no regex match yet
  if (urls.length === 0) {
    const single = normalizeSingleUrl(input)
    if (single) urls.push(single)
  }

  return urls
}
