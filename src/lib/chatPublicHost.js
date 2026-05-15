/**
 * Public anonymous chat is served on its own hostname (e.g. chat.daviapp.nl).
 * Used by middleware + root layout to skip Keycloak and restrict routes.
 *
 * Comma-separated allowed hostnames, with or without scheme:
 *   CHAT_PUBLIC_HOSTNAME="https://chat.daviapp.nl,staging-chat.example.com"
 */
export const CHAT_PUBLIC_HOST_MIDDLEWARE_HEADER = 'x-davi-chat-public-host'
export const CHAT_PUBLIC_HOST_MIDDLEWARE_VALUE = '1'

/** Set on every middleware response when the browser host is the public chat hostname (HttpOnly; SSR reads Cookie header). */
export const CHAT_PUBLIC_HOST_COOKIE = 'davi_chat_public_host'
export const CHAT_PUBLIC_HOST_COOKIE_VALUE = '1'

export function normalizedChatPublicHostnames() {
  const raw =
    process.env.CHAT_PUBLIC_HOSTNAME ||
    process.env.NEXT_PUBLIC_CHAT_PUBLIC_HOSTNAME ||
    'https://chat.daviapp.nl'
  return raw
    .split(',')
    .map((s) =>
      s
        .trim()
        .replace(/^https?:\/\//, '')
        .split('/')[0]
        .split(':')[0]
        .toLowerCase(),
    )
    .filter(Boolean)
}

/**
 * @param {string | undefined} hostname host only, no port (or port stripped)
 */
export function hostnameIsChatPublicHost(hostname) {
  const h = (hostname || '').split(':')[0].trim().toLowerCase()
  if (!h) return false
  return normalizedChatPublicHostnames().includes(h)
}

/**
 * Collect hostnames from incoming request headers (Host + every x-forwarded-host segment).
 * Proxies sometimes send a wrong primary x-forwarded-host; checking all avoids missing the chat host.
 */
export function hostCandidatesFromHeaders(headersList) {
  const out = []
  const push = (s) => {
    if (!s || typeof s !== 'string') return
    const base = s.split(':')[0].trim().toLowerCase()
    if (base && !out.includes(base)) out.push(base)
  }
  const host = headersList.get('host')
  if (host) push(host)
  const xf = headersList.get('x-forwarded-host')
  if (xf) {
    for (const part of xf.split(',')) {
      push(part)
    }
  }

  const xOrig = headersList.get('x-original-host')
  if (xOrig) push(xOrig)

  const forwarded = headersList.get('forwarded')
  if (forwarded) {
    for (const directive of forwarded.split(',')) {
      const m = /host\s*=\s*"?([^";\s,]+)"?/i.exec(directive.trim())
      if (m?.[1]) push(m[1])
    }
  }

  const vercelHost = headersList.get('x-vercel-forwarded-host')
  if (vercelHost) {
    for (const part of vercelHost.split(',')) {
      push(part)
    }
  }

  return out
}

/**
 * Whether this request targets the anonymous chat hostname (suppress Keycloak, avoid ProtectedRoute on `/`).
 * @param {Headers} headersList
 * @param {{ get: (name: string) => { value: string } | undefined } | null | undefined} cookieStore
 */
export function requestIsChatPublicHost(headersList, cookieStore) {
  try {
    if (
      cookieStore?.get(CHAT_PUBLIC_HOST_COOKIE)?.value ===
      CHAT_PUBLIC_HOST_COOKIE_VALUE
    ) {
      return true
    }
  } catch {
    /* cookies() unavailable */
  }

  const suppressFromMiddleware =
    headersList.get(CHAT_PUBLIC_HOST_MIDDLEWARE_HEADER) ===
    CHAT_PUBLIC_HOST_MIDDLEWARE_VALUE
  if (suppressFromMiddleware) return true
  return hostCandidatesFromHeaders(headersList).some((h) =>
    hostnameIsChatPublicHost(h),
  )
}
