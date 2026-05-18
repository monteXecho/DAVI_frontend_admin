import { NextResponse } from 'next/server'

import {
  CHAT_PUBLIC_HOST_COOKIE,
  CHAT_PUBLIC_HOST_COOKIE_VALUE,
  CHAT_PUBLIC_HOST_MIDDLEWARE_HEADER,
  CHAT_PUBLIC_HOST_MIDDLEWARE_VALUE,
  DAVI_PATHNAME_HEADER,
  hostnameIsChatPublicHost,
} from '@/lib/chatPublicHost'
import {
  canonicalPathIfLegacyPublicChat,
  isAllowedPublicChatPath,
  migrateLegacyPublicChatPath,
  PUBLIC_CHAT_RESUME_COOKIE,
} from '@/lib/publicChatResume'

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

function nextOnChatPublicHost(request, requestHeaders) {
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
    const migrated =
      migrateLegacyPublicChatPath(decoded.replace(/\/+$/, '') || decoded) ||
      decoded
    if (!isAllowedPublicChatPath(migrated)) return null
    return migrated.replace(/\/+$/, '') || migrated
  } catch {
    return null
  }
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(DAVI_PATHNAME_HEADER, pathname)

  /**
   * Legacy `/publicChat/{uuid}/{chat}` must become `/publicChat/{chat}/{uuid}` on **every** host.
   * Otherwise `[chatName]` wrongly captures the UUID (bad PWA names, broken sibling installs).
   */
  const legacyCanonical = canonicalPathIfLegacyPublicChat(pathname)
  if (legacyCanonical) {
    const dest = request.nextUrl.clone()
    dest.pathname = legacyCanonical
    const res = NextResponse.redirect(dest, 308)
    const hn = (request.nextUrl.hostname || '').split(':')[0].toLowerCase()
    if (hostnameIsChatPublicHost(hn)) {
      stampChatPublicHostCookie(request, res)
    }
    return res
  }

  const requestHostname = (request.nextUrl.hostname || '')
    .split(':')[0]
    .toLowerCase()
  const isChatOnlyHost = hostnameIsChatPublicHost(requestHostname)

  if (!isChatOnlyHost) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const p = pathname

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
    return nextOnChatPublicHost(request, requestHeaders)
  }

  if (p === '/favicon.ico' || p === '/robots.txt' || p === '/progressier.js') {
    return nextOnChatPublicHost(request, requestHeaders)
  }

  if (/\.(?:ico|png|jpg|jpeg|webp|gif|svg|woff2?)$/i.test(p)) {
    return nextOnChatPublicHost(request, requestHeaders)
  }

  const notFound = new NextResponse(null, { status: 404 })
  stampChatPublicHostCookie(request, notFound)
  return notFound
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
