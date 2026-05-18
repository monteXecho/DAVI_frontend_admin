/**
 * Web App Manifest JSON for chat.daviapp.nl installs.
 * Root-relative fields resolve to the live document origin (reverse-proxy safe).
 *
 * Scope must be narrow per chat so multiple PWAs on chat.daviapp.nl stay distinct;
 * see https://web.dev/articles/building-multiple-pwas-on-the-same-domain
 */

/** Same visual as empty-state center badge on `PublicChatPage` (gradient tile + chat bubble). */
export const DEFAULT_PUBLIC_CHAT_PWA_ICON_SVG = '/icons/public-chat-pwa-icon.svg'

/**
 * Stable path-only manifest `id` (same origin).
 * Not derived only from shallow `/publicChat/…`; combined with `{chatSlug}/{uuid}` canonical URLs so
 * sibling installs stay distinct (Chromium link capture / merged install behavior).
 *
 * Manifest `id` need not map to a real document (W3C: not required within scope).
 */
export function publicChatManifestIdentityPath(adminId, chatSlug) {
  const a = encodeURIComponent(String(adminId).trim())
  const c = encodeURIComponent(String(chatSlug).trim())
  return `/davi-chat-pwa-id/${a}/${c}`
}

/** `/publicChat/a/b` → scope prefix `/publicChat/a/b/` so other chats are out-of-scope */
export function narrowPublicChatScope(startPathNoQuery) {
  const raw = startPathNoQuery.startsWith('/')
    ? startPathNoQuery
    : `/${startPathNoQuery}`
  const trimmed = raw.replace(/\/+$/, '') || '/'
  return `${trimmed}/`
}

/**
 * @param {{ startPath: string, manifestIdentityPath: string, name?: string, shortName?: string }} opts
 */
export function buildPublicChatManifestJson(opts) {
  const {
    startPath,
    manifestIdentityPath,
    name = 'DAVI',
    shortName = 'DAVI',
  } = opts
  const relStart = startPath.startsWith('/') ? startPath : `/${startPath}`
  /** Path-absolute: resolves to current origin (must match HTML document). */
  const start_url = relStart.replace(/\/+$/, '') || '/'
  const scope = narrowPublicChatScope(relStart)
  const id =
    manifestIdentityPath.startsWith('/')
      ? manifestIdentityPath
      : `/${manifestIdentityPath}`

  /** Public chat PWAs always use the in-page branded SVG (PNG env overrides were masking it). */
  /** @type {{ src: string; sizes: string; type: string; purpose: string }[]} */
  const icons = []
  icons.push({
    src: DEFAULT_PUBLIC_CHAT_PWA_ICON_SVG,
    sizes: 'any',
    type: 'image/svg+xml',
    purpose: 'any',
  })
  icons.push({
    src: DEFAULT_PUBLIC_CHAT_PWA_ICON_SVG,
    sizes: 'any',
    type: 'image/svg+xml',
    purpose: 'maskable',
  })

  const bg = process.env.NEXT_PUBLIC_CHAT_PWA_BACKGROUND || '#ffffff'
  const theme = process.env.NEXT_PUBLIC_CHAT_PWA_THEME || '#ffffff'

  /** Home screen labels: allow longer labels than legacy 12-char cap where supported. */
  const shortLimit = Number(process.env.NEXT_PUBLIC_CHAT_PWA_SHORT_NAME_MAX_LEN) || 40
  const short =
    typeof shortName === 'string' && shortName.length > shortLimit
      ? shortName.slice(0, shortLimit - 1).trimEnd() + '…'
      : shortName

  return {
    name,
    short_name: short,
    description: 'DAVI publieke chat',
    start_url,
    scope,
    display: 'standalone',
    display_override: ['standalone', 'browser'],
    orientation: 'portrait',
    background_color: bg,
    theme_color: theme,
    ...(icons.length ? { icons } : {}),
    id,
    prefer_related_applications: false,
  }
}
