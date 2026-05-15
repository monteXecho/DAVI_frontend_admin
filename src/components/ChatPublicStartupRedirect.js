'use client';

import { hostnameIsChatPublicHost } from '@/lib/chatPublicHost';
import { readRememberedPublicChatPath } from '@/lib/publicChatResume';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';

/**
 * Backup if the inline script missed (e.g. SPA navigation to `/`). Uses a
 * full navigation so a controlling service worker cannot keep `/?launchedfrom=…`.
 */
export default function ChatPublicStartupRedirect({ enabled }) {
  const pathname = usePathname();
  const ran = useRef(false);

  useLayoutEffect(() => {
    if (ran.current || typeof window === 'undefined') return;

    const onChatDomain = hostnameIsChatPublicHost(window.location.hostname);
    if (!enabled && !onChatDomain) return;

    const p = pathname ?? '';
    if (p !== '/' && p !== '') return;

    ran.current = true;

    const rel = readRememberedPublicChatPath() || '/publicChat';
    const url = `${window.location.origin}${rel.startsWith('/') ? rel : `/${rel}`}`;
    window.location.replace(url);
  }, [enabled, pathname]);

  return null;
}
