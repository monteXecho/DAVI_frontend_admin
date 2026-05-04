/**
 * Build the absolute URL for the unauthenticated public chat page.
 * Matches Next route: /publicChat/[company_admin]/[chatName] and API /public-chat/{company_admin}/{chat_name}
 * where company_admin is the company admin's user_id (or email) and chat_name is the stored chat name.
 */
export function buildPublicChatPageUrl(adminUserId, chatName) {
  if (typeof window === 'undefined') return ''
  const origin = window.location.origin
  const admin = encodeURIComponent(adminUserId || '')
  const chat = encodeURIComponent(chatName || '')
  return `${origin}/publicChat/${admin}/${chat}`
}
