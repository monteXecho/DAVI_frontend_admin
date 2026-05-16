/**
 * Manifest only for the exact route `/publicChat` (hub). Deep chat URLs use
 * `[company_admin]/[chatName]/layout.js` → per-chat install-manifest.
 * (A parent manifest on `publicChat/layout.js` was overriding all children.)
 */

export const metadata = {
  manifest: "/publicChat/launcher-manifest",
};

export default function PublicChatHubLayout({ children }) {
  return children;
}
