import { buildPublicChatManifestJson } from '@/lib/chatPwaManifest'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET(request) {
  const origin = new URL(request.url).origin
  const body = buildPublicChatManifestJson(origin, {
    startPath: '/publicChat',
    name: 'DAVI — Publieke chat',
    shortName: 'DAVI chat',
  })
  return NextResponse.json(body, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
