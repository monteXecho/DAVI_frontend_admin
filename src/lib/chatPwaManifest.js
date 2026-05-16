/**
 * Web App Manifest JSON for chat.daviapp.nl installs.
 * Use root-relative `start_url`, `scope`, `id`, and icon paths so they always match the
 * document origin. Route handlers often see `http://localhost:...` behind a reverse proxy;
 * absolute URLs built from that break install (Chromium: same-origin checks on manifest).
 */

function manifestIconSrc(envVal) {
  if (!envVal || typeof envVal !== 'string') return null
  const t = envVal.trim()
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  if (t.startsWith('/')) return t
  return `/${t}`
}

/**
 * @param {{ startPath: string, name?: string, shortName?: string }} opts `startPath` begins with /
 */
export function buildPublicChatManifestJson(opts) {
  const { startPath, name = 'DAVI', shortName = 'DAVI' } = opts
  const relStart = startPath.startsWith('/') ? startPath : `/${startPath}`
  /** Path-absolute: resolves to current origin (must match HTML document). */
  const start_url = relStart
  /** Chat host is dedicated; root scope avoids `publicChat` vs `publicChat/` prefix mismatches. */
  const scope = '/'
  const id = relStart

  const icon192 = manifestIconSrc(process.env.NEXT_PUBLIC_CHAT_PWA_ICON_192)
  const icon256 = manifestIconSrc(process.env.NEXT_PUBLIC_CHAT_PWA_ICON_256)
  const icon512 = manifestIconSrc(process.env.NEXT_PUBLIC_CHAT_PWA_ICON_512)

  /** @type {{ src: string; sizes: string; type: string; purpose: string }[]} */
  const icons = []
  if (icon192) {
    icons.push({
      src: icon192,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    })
  }
  if (icon256) {
    icons.push({
      src: icon256,
      sizes: '256x256',
      type: 'image/png',
      purpose: 'any',
    })
  }
  if (icon512) {
    icons.push({
      src: icon512,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    })
  }

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
    launch_handler: {
      client_mode: 'navigate-existing',
    },
  }
}
