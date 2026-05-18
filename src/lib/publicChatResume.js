/** localStorage key: last canonical public chat path (`/publicChat/{chat}/{adminUuid}`). */
export const PUBLIC_CHAT_RESUME_PATH_KEY = 'davi_public_chat_resume_path'

/** Readable by middleware on chat host — mirrors resume path for cold PWA opens (localStorage is not sent). */
export const PUBLIC_CHAT_RESUME_COOKIE = 'davi_public_chat_resume'

/** Company admin IDs in DAVI routes are UUIDs; used to detect legacy path order vs chat slug order. */
export const PUBLIC_CHAT_ADMIN_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Older links used `/publicChat/{adminUuid}/{chatName}`.
 * Canonical URLs are `/publicChat/{chatName}/{adminUuid}` so sibling chats under one admin no longer
 * share a common `/…/{uuid}/…` prefix (Chromium was merging installs / link capture across that branch).
 *
 * Returns `pathname` if already canonical or not a deep public chat URL.
 */
export function migrateLegacyPublicChatPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return pathname
  const p = pathname.split('?')[0].replace(/\/+$/, '') || '/'
  const m = p.match(/^\/publicChat\/([^/]+)\/([^/]+)$/)
  if (!m) return p
  const [, a, b] = m
  const decA = decodeURIComponent(a)
  const decB = decodeURIComponent(b)
  if (
    PUBLIC_CHAT_ADMIN_UUID_RE.test(decA) &&
    !PUBLIC_CHAT_ADMIN_UUID_RE.test(decB)
  ) {
    return `/publicChat/${encodeURIComponent(decB)}/${encodeURIComponent(decA)}`
  }
  return p
}

/**
 * If pathname is legacy order, returns the canonical path (no query). Else null.
 */
export function canonicalPathIfLegacyPublicChat(urlPathname) {
  const migrated = migrateLegacyPublicChatPath(
    (urlPathname || '').split('?')[0].replace(/\/+$/, '') || '/',
  )
  const cleaned = (urlPathname || '').split('?')[0].replace(/\/+$/, '') || '/'
  return migrated !== cleaned ? migrated : null
}

/**
 * Allowed deep link: canonical `/publicChat/{chatSlug}/{adminUuid}` with UUID admin (last segment).
 */
export function isAllowedPublicChatPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return false
  const stripped = pathname.split('?')[0].replace(/\/+$/, '')
  if (!stripped) return false
  const p = migrateLegacyPublicChatPath(stripped)
  if (!p.startsWith('/publicChat/')) return false
  const rest = p.slice('/publicChat/'.length)
  const parts = rest.split('/').filter(Boolean)
  if (parts.length !== 2) return false
  const [maybeChat, maybeAdmin] = parts.map((seg) =>
    decodeURIComponent(seg || ''),
  )
  if (
    !maybeChat ||
    !maybeAdmin ||
    !PUBLIC_CHAT_ADMIN_UUID_RE.test(maybeAdmin)
  ) {
    return false
  }
  if (PUBLIC_CHAT_ADMIN_UUID_RE.test(maybeChat)) return false
  return true
}

export function rememberPublicChatPath(pathname) {
  if (typeof window === 'undefined') return
  try {
    const trimmed = pathname.split('?')[0].replace(/\/+$/, '') || pathname
    const normalized = migrateLegacyPublicChatPath(trimmed)
    if (!isAllowedPublicChatPath(normalized)) return

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
    if (!raw) return null
    const migrated = migrateLegacyPublicChatPath(
      raw.replace(/\/+$/, '') || raw,
    )
    if (!isAllowedPublicChatPath(migrated)) return null
    return migrated.replace(/\/+$/, '') || migrated
  } catch {
    return null
  }
}
