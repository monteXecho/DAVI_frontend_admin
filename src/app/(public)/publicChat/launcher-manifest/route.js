import { buildPublicChatManifestJson } from '@/lib/chatPwaManifest'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  const body = buildPublicChatManifestJson({
    startPath: '/publicChat/',
    name:
      process.env.NEXT_PUBLIC_CHAT_LAUNCHER_PWA_NAME || 'DAVI - Publieke chat',
    shortName:
      process.env.NEXT_PUBLIC_CHAT_LAUNCHER_PWA_SHORT_NAME ||
      'DAVI - Publieke chat',
  })
  return NextResponse.json(body, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
