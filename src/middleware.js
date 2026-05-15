import { NextResponse } from 'next/server'

import {
  CHAT_PUBLIC_HOST_COOKIE,
  CHAT_PUBLIC_HOST_COOKIE_VALUE,
  CHAT_PUBLIC_HOST_MIDDLEWARE_HEADER,
  CHAT_PUBLIC_HOST_MIDDLEWARE_VALUE,
  hostnameIsChatPublicHost,
} from '@/lib/chatPublicHost'
import {
  isAllowedPublicChatPath,
  PUBLIC_CHAT_RESUME_COOKIE,
} from '@/lib/publicChatResume'

/**
 * When the app is served on CHAT_PUBLIC_HOSTNAME (e.g. chat.daviapp.nl),
 * only /publicChat and Next/static assets stay reachable — all admin and
 * other app routes get 404. Main site (e.g. daviapp.nl) is unchanged.
 */
function stampChatPublicHostCookie(request, response) {
  const protocol = request.nextUrl.protocol
  response.cookies.set(
    CHAT_PUBLIC_HOST_COOKIE,
    CHAT_PUBLIC_HOST_COOKIE_VALUE,
    {
      path: '/',
      sameSite: 'lax',
      secure: protocol === 'https:',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 400,
    },
  )
}

function nextOnChatPublicHost(request) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.delete(CHAT_PUBLIC_HOST_MIDDLEWARE_HEADER)
  requestHeaders.set(
    CHAT_PUBLIC_HOST_MIDDLEWARE_HEADER,
    CHAT_PUBLIC_HOST_MIDDLEWARE_VALUE,
  )
  const res = NextResponse.next({ request: { headers: requestHeaders } })
  stampChatPublicHostCookie(request, res)
  return res
}

function resumePathFromCookie(request) {
  const raw = request.cookies.get(PUBLIC_CHAT_RESUME_COOKIE)?.value
  if (!raw) return null
  try {
    const decoded = decodeURIComponent(raw)
    if (!isAllowedPublicChatPath(decoded)) return null
    return decoded.replace(/\/$/, '') || decoded
  } catch {
    return null
  }
}

export function middleware(request) {
  const requestHostname = (request.nextUrl.hostname || '')
    .split(':')[0]
    .toLowerCase()
  const isChatOnlyHost = hostnameIsChatPublicHost(requestHostname)

  if (!isChatOnlyHost) {
    return NextResponse.next()
  }

  const p = request.nextUrl.pathname

  /** PWA cold start often hits `/` or `/publicChat` — redirect to saved deep link before React (no Keycloak flash). */
  const resume = resumePathFromCookie(request)
  if (resume && (p === '/' || p === '' || p === '/publicChat')) {
    const res = NextResponse.redirect(new URL(resume, request.url))
    stampChatPublicHostCookie(request, res)
    return res
  }

  if (p === '/' || p === '') {
    const res = NextResponse.redirect(new URL('/publicChat', request.url))
    stampChatPublicHostCookie(request, res)
    return res
  }

  if (
    p === '/publicChat' ||
    p.startsWith('/publicChat/') ||
    p.startsWith('/_next/')
  ) {
    return nextOnChatPublicHost(request)
  }

  if (p === '/favicon.ico' || p === '/robots.txt' || p === '/progressier.js') {
    return nextOnChatPublicHost(request)
  }

  if (/\.(?:ico|png|jpg|jpeg|webp|gif|svg|woff2?)$/i.test(p)) {
    return nextOnChatPublicHost(request)
  }

  const notFound = new NextResponse(null, { status: 404 })
  stampChatPublicHostCookie(request, notFound)
  return notFound
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
