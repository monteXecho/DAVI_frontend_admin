'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function ThirdPartyScripts() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const loadCookiebot = (attempt = 1, maxAttempts = 3) => {
      if (typeof window === 'undefined') return;
      
      if (document.getElementById('Cookiebot') || window.Cookiebot) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'Cookiebot';
      script.src = 'https://consent.cookiebot.com/uc.js';
      script.setAttribute('data-cbid', '515f801d-02f6-4a38-94ad-fb3529a17575');
      script.setAttribute('data-blockingmode', 'auto');
      script.type = 'text/javascript';
      script.async = false;

      script.onload = () => {
        const checkCookiebot = (attempt = 1, maxAttempts = 10) => {
          if (window.Cookiebot) {
            const consent = window.Cookiebot.consent;
            const hasConsent = consent && (consent.preferences || consent.statistics || consent.marketing);
            
            if (hasConsent) {
              return;
            }
            
            const dialog = document.getElementById('CybotCookiebotDialog');
            if (dialog) {
              const isVisible = dialog.style.display !== 'none' && 
                                !dialog.hasAttribute('hidden') &&
                                dialog.offsetParent !== null;
              
              if (isVisible) {
                return;
              }
            }
            
            if (typeof window.Cookiebot.show === 'function') {
              try {
                window.Cookiebot.show();
              } catch (e) {
                // Silent fail
              }
            } else if (typeof window.Cookiebot.renew === 'function') {
              try {
                window.Cookiebot.renew();
              } catch (e) {
                // Silent fail
              }
            }
          } else if (attempt < maxAttempts) {
            setTimeout(() => checkCookiebot(attempt + 1, maxAttempts), 200);
          }
        };
        
        setTimeout(() => checkCookiebot(), 300);
      };

      script.onerror = () => {
        const failedScript = document.getElementById('Cookiebot');
        if (failedScript) {
          failedScript.remove();
        }
        if (attempt < maxAttempts) {
          setTimeout(() => {
            loadCookiebot(attempt + 1, maxAttempts);
          }, 1000 * attempt);
        }
      };

      document.head.appendChild(script);
    };

    const timer = setTimeout(() => {
      loadCookiebot();
    }, 0);

    let checkCount = 0;
    const maxChecks = 5;
    const checkInterval = setInterval(() => {
      if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
        return;
      }
      checkCount++;
      
      if (window.Cookiebot) {
        const consent = window.Cookiebot.consent;
        const hasConsent = consent && (consent.preferences || consent.statistics || consent.marketing);
        
        const dialog = document.getElementById('CybotCookiebotDialog');
        if (!dialog) {
          if (hasConsent) {
            if (checkCount >= 2) {
              clearInterval(checkInterval);
            }
          } else {
            if (typeof window.Cookiebot.show === 'function') {
              try {
                window.Cookiebot.show();
              } catch (e) {
                // Silent fail
              }
            }
          }
        } else {
          const isVisible = dialog.style.display !== 'none' && 
                           !dialog.hasAttribute('hidden') &&
                           dialog.offsetParent !== null;
          if (isVisible) {
            clearInterval(checkInterval);
          } else {
            if (hasConsent) {
              if (checkCount >= 2) {
                clearInterval(checkInterval);
              }
            } else {
              if (typeof window.Cookiebot.show === 'function') {
                try {
                  window.Cookiebot.show();
                } catch (e) {
                  // Silent fail
                }
              }
            }
          }
        }
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(checkInterval);
    };
  }, [isHydrated]);

  return (
    <Script
      src="https://progressier.app/GeBtvVp5TAAGbHE3O2GE/script.js"
      strategy="afterInteractive"
    />
  );
}
