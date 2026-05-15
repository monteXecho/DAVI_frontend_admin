/**
 * Web App Manifest JSON for chat.daviapp.nl installs.
 * `start_url` is what standalone/PWA launches use — deep chat pages get their own manifest route.
 */

function absoluteAsset(origin, src) {
  if (!src || typeof src !== 'string') return null
  const t = src.trim()
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  if (t.startsWith('/')) return `${origin}${t}`
  return `${origin}/${t}`
}

/**
 * @param {string} origin e.g. https://chat.daviapp.nl
 * @param {{ startPath: string, name?: string, shortName?: string }} opts startPath begins with /
 */
export function buildPublicChatManifestJson(origin, opts) {
  const { startPath, name = 'DAVI', shortName = 'DAVI' } = opts
  const start_url = startPath.startsWith('/') ? startPath : `/${startPath}`
  const scope = '/publicChat/'

  const i256 = absoluteAsset(origin, process.env.NEXT_PUBLIC_CHAT_PWA_ICON_256)
  const i512 = absoluteAsset(origin, process.env.NEXT_PUBLIC_CHAT_PWA_ICON_512)
  /** @type {{ src: string; sizes: string; type: string; purpose: string }[]} */
  const icons = []
  if (i256) {
    icons.push({
      src: i256,
      sizes: '256x256',
      type: 'image/png',
      purpose: 'any',
    })
  }
  if (i512) {
    icons.push({
      src: i512,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    })
  }

  const bg = process.env.NEXT_PUBLIC_CHAT_PWA_BACKGROUND || '#ffffff'
  const theme = process.env.NEXT_PUBLIC_CHAT_PWA_THEME || '#ffffff'

  return {
    name,
    short_name: shortName.slice(0, 12),
    description: 'DAVI publieke chat',
    start_url,
    scope,
    display: 'standalone',
    orientation: 'portrait',
    background_color: bg,
    theme_color: theme,
    ...(icons.length ? { icons } : {}),
    id: `${origin}${start_url}`,
  }
}
