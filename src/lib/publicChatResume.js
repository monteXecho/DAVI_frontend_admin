/** localStorage key: last concrete public chat path (e.g. /publicChat/{admin}/{name}) */
export const PUBLIC_CHAT_RESUME_PATH_KEY = 'davi_public_chat_resume_path'

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
