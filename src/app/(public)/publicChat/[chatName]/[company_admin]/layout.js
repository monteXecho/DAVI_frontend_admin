/** Per-chat Web App Manifest so installs from this URL launch back into this chat (start_url). */

import { normalizePublicChatRouteParams } from '@/lib/publicChatResume'

export async function generateMetadata({ params }) {
  const { company_admin: companyAdmin, chatName } = await params
  const { adminId, chatSlug } = normalizePublicChatRouteParams(
    companyAdmin,
    chatName,
  )
  const base = `/publicChat/${encodeURIComponent(chatSlug)}/${encodeURIComponent(adminId)}`
  const labelRaw = chatSlug.slice(0, 50) || 'Chat'
  const prefix = process.env.NEXT_PUBLIC_CHAT_PWA_NAME_PREFIX ?? 'DAVI - '
  const displayName = `${prefix}${labelRaw}`.slice(0, 120)

  return {
    manifest: `${base}/install-manifest`,
    title: displayName,
    applicationName: displayName,
    appleWebApp: {
      capable: true,
      title: displayName,
      statusBarStyle: 'default',
    },
  }
}

export default function PublicChatSessionLayout({ children }) {
  return children;
}
