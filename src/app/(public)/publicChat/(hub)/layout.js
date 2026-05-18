/**
 * Hub route `/publicChat` intentionally has no linked manifest: any scope covering `/publicChat`
 * would overlap every deep chat URL and collapse installs into one “catch‑all” PWA.
 * Install each chat from its canonical URL (`…/publicChat/{chat}/{adminUuid}`). Legacy `{admin}/{chat}` redirects.
 */

export default function PublicChatHubLayout({ children }) {
  return children;
}
