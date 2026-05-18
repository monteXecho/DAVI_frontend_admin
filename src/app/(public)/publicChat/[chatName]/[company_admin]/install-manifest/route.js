import {
  buildPublicChatManifestJson,
  publicChatManifestIdentityPath,
} from '@/lib/chatPwaManifest'
import {
  isAllowedPublicChatPath,
  normalizePublicChatRouteParams,
} from '@/lib/publicChatResume'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, context) {
  const params = await context.params
  const adminRaw = params?.company_admin
  const chatRaw = params?.chatName
  if (
    typeof adminRaw !== 'string' ||
    typeof chatRaw !== 'string' ||
    !adminRaw.trim() ||
    !chatRaw.trim()
  ) {
    return new NextResponse(null, { status: 404 })
  }

  const { adminId, chatSlug } = normalizePublicChatRouteParams(
    adminRaw,
    chatRaw,
  )
  const startPath = `/publicChat/${encodeURIComponent(chatSlug)}/${encodeURIComponent(adminId)}`
  if (!isAllowedPublicChatPath(startPath)) {
    return new NextResponse(null, { status: 404 })
  }

  const labelRaw = chatSlug.slice(0, 50) || 'Chat'
  const prefix =
    process.env.NEXT_PUBLIC_CHAT_PWA_NAME_PREFIX ?? 'DAVI - '
  const fullName =
    `${prefix}${labelRaw}`.slice(0, 120)

  const body = buildPublicChatManifestJson({
    startPath,
    manifestIdentityPath: publicChatManifestIdentityPath(adminId, chatSlug),
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
