import { buildPublicChatManifestJson } from '@/lib/chatPwaManifest'
import { isAllowedPublicChatPath } from '@/lib/publicChatResume'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, context) {
  const params = await context.params
  const admin = params?.company_admin
  const chatName = params?.chatName
  if (
    typeof admin !== 'string' ||
    typeof chatName !== 'string' ||
    !admin.trim() ||
    !chatName.trim()
  ) {
    return new NextResponse(null, { status: 404 })
  }

  const startPath = `/publicChat/${admin}/${chatName}`
  if (!isAllowedPublicChatPath(startPath)) {
    return new NextResponse(null, { status: 404 })
  }

  const origin = new URL(request.url).origin
  const label =
    decodeURIComponent(chatName).slice(0, 40) || 'Chat'

  const body = buildPublicChatManifestJson(origin, {
    startPath,
    name: `DAVI — ${label}`,
    shortName: label.slice(0, 12),
  })

  return NextResponse.json(body, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'private, max-age=600',
    },
  })
}
