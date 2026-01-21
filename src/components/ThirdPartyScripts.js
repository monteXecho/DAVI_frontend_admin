'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function ThirdPartyScripts() {
  const [isHydrated, setIsHydrated] = useState(false);
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    setIsHydrated(true);

    // In development, unregister any existing service workers to prevent issues
    if (!isProduction && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch((err) => {
            console.warn('Failed to unregister service worker:', err);
          });
        }
      });
    }

    // Prevent service worker registration errors from breaking the app
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Override serviceWorker.register to catch and handle errors gracefully
      const originalRegister = navigator.serviceWorker.register.bind(navigator.serviceWorker);
      
      navigator.serviceWorker.register = function(...args) {
        return originalRegister(...args).catch((error) => {
          // Log warning but don't break the app
          if (error.message && !error.message.includes('404')) {
            console.warn('Service worker registration failed (non-critical):', error.message);
          }
          // Return a rejected promise but don't throw
          return Promise.reject(error);
        });
      };
    }

    // Handle unhandled service worker errors
    window.addEventListener('error', (event) => {
      if (event.message && (
        event.message.includes('ServiceWorker') ||
        event.message.includes('service worker') ||
        event.message.includes('progressier')
      )) {
        event.preventDefault();
        console.warn('Service worker error caught (non-critical):', event.message);
        return false;
      }
    }, true);

    // Handle unhandled promise rejections from service workers
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && (
        event.reason.message?.includes('ServiceWorker') ||
        event.reason.message?.includes('service worker') ||
        event.reason.message?.includes('progressier')
      )) {
        event.preventDefault();
        console.warn('Service worker promise rejection caught (non-critical):', event.reason);
      }
    });
  }, [isProduction]);

  useEffect(() => {
    // Only load third-party scripts in production
    if (!isHydrated || !isProduction) return;

    const loadCookiebot = (attempt = 1, maxAttempts = 3) => {
      if (typeof window === 'undefined') return;
      
      if (document.getElementById('Cookiebot') || window.Cookiebot) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'Cookiebot';
      script.src = 'https://consent.cookiebot.com/uc.js';
      script.setAttribute('data-cbid', '07a76009-c76a-4918-a40a-7f4d0fb4fbef');
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
                console.warn('Cookiebot show failed:', e);
              }
            } else if (typeof window.Cookiebot.renew === 'function') {
              try {
                window.Cookiebot.renew();
              } catch (e) {
                // Silent fail
                console.warn('Cookiebot renew failed:', e);
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
        } else {
          console.warn('Cookiebot failed to load after multiple attempts');
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
                console.warn('Cookiebot show failed:', e);
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
                  console.warn('Cookiebot show failed:', e);
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
  }, [isHydrated, isProduction]);

  // Only load Progressier in production
  if (!isProduction) {
    return null;
  }

  return (
    <Script
      src="https://progressier.app/GeBtvVp5TAAGbHE3O2GE/script.js"
      strategy="afterInteractive"
      onError={(e) => {
        console.warn('Progressier script failed to load:', e);
      }}
    />
  );
}
