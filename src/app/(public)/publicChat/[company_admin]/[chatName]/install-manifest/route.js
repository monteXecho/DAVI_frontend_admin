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

  const labelRaw = decodeURIComponent(chatName).slice(0, 50) || 'Chat'
  const prefix =
    process.env.NEXT_PUBLIC_CHAT_PWA_NAME_PREFIX ?? 'DAVI - '
  const fullName =
    `${prefix}${labelRaw}`.slice(0, 120)

  const body = buildPublicChatManifestJson({
    startPath,
    name: fullName,
    /** Under-icon text: same pattern so it matches OS “app name” where space allows */
    shortName: fullName,
  })

  return NextResponse.json(body, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'private, max-age=600',
    },
  })
}
