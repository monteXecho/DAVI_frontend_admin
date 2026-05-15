import { NextResponse } from 'next/server'

/**
 * When the app is served on CHAT_PUBLIC_HOSTNAME (e.g. chat.daviapp.nl),
 * only /publicChat and Next/static assets stay reachable — all admin and
 * other app routes get 404. Main site (e.g. daviapp.nl) is unchanged.
 */
const chatOnlyHostname =
  process.env.CHAT_PUBLIC_HOSTNAME || 'https://chat.daviapp.nl'

function normalizeHost(hostname) {
  const h = (hostname || '').split(':')[0].toLowerCase()
  const cfg = chatOnlyHostname.replace(/^https?:\/\//, '').trim().split('/')[0].toLowerCase()
  return { requestHost: h, restrictedHost: cfg }
}

export function middleware(request) {
  const { requestHost, restrictedHost } = normalizeHost(request.nextUrl.hostname)
  const isChatOnlyHost =
    restrictedHost && requestHost === restrictedHost

  if (!isChatOnlyHost) {
    return NextResponse.next()
  }

  const p = request.nextUrl.pathname

  if (
    p === '/publicChat' ||
    p.startsWith('/publicChat/') ||
    p.startsWith('/_next/')
  ) {
    return NextResponse.next()
  }

  if (p === '/favicon.ico' || p === '/robots.txt' || p === '/progressier.js') {
    return NextResponse.next()
  }

  if (/\.(?:ico|png|jpg|jpeg|webp|gif|svg|woff2?)$/i.test(p)) {
    return NextResponse.next()
  }

  return new NextResponse(null, { status: 404 })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
