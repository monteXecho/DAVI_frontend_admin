/** localStorage key: last concrete public chat path (e.g. /publicChat/{admin}/{name}) */
export const PUBLIC_CHAT_RESUME_PATH_KEY = 'davi_public_chat_resume_path'

/** Readable by middleware on chat host — mirrors resume path for cold PWA opens (localStorage is not sent). */
export const PUBLIC_CHAT_RESUME_COOKIE = 'davi_public_chat_resume'

/**
 * True if pathname is exactly /publicChat/{segment}/{segment} (no open redirects).
 */
export function isAllowedPublicChatPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return false
  const p = pathname.split('?')[0].replace(/\/$/, '') || '/'
  if (!p.startsWith('/publicChat/')) return false
  const rest = p.slice('/publicChat/'.length)
  const parts = rest.split('/').filter(Boolean)
  return parts.length === 2 && parts.every((s) => s.length > 0)
}

export function rememberPublicChatPath(pathname) {
  if (typeof window === 'undefined' || !isAllowedPublicChatPath(pathname)) return
  try {
    const normalized = pathname.split('?')[0].replace(/\/$/, '') || pathname
    localStorage.setItem(PUBLIC_CHAT_RESUME_PATH_KEY, normalized)

    const secure =
      typeof window !== 'undefined' && window.location.protocol === 'https:'
    const segments = [
      `${PUBLIC_CHAT_RESUME_COOKIE}=${encodeURIComponent(normalized)}`,
      'Path=/',
      `Max-Age=${365 * 24 * 60 * 60}`,
      'SameSite=Lax',
    ]
    if (secure) segments.push('Secure')
    document.cookie = segments.join('; ')
  } catch {
    /* private mode / quota */
  }
}

export function readRememberedPublicChatPath() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PUBLIC_CHAT_RESUME_PATH_KEY)
    if (!raw || !isAllowedPublicChatPath(raw)) return null
    return raw.replace(/\/$/, '') || raw
  } catch {
    return null
  }
}
