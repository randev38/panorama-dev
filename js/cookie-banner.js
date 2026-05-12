const COOKIE_CONSENT_STORAGE_KEY = 'panorama-cookie-consent';

const initCookieBanner = () => {
   const banner = document.querySelector('[data-cookie-banner]');

   if (!(banner instanceof HTMLElement)) {
      return;
   }

   const acceptButton = banner.querySelector('[data-cookie-action="accept"]');
   if (!(acceptButton instanceof HTMLButtonElement)) {
      return;
   }

   const canUseStorage = (() => {
      try {
         const testKey = '__panorama_cookie_banner__';
         window.localStorage.setItem(testKey, '1');
         window.localStorage.removeItem(testKey);
         return true;
      } catch (error) {
         return false;
      }
   })();

   const syncConsentState = (value = '') => {
      if (value) {
         document.documentElement.dataset.cookieConsent = value;
      } else {
         delete document.documentElement.dataset.cookieConsent;
      }

      window.dispatchEvent(new CustomEvent('panorama:cookie-consent-change', {
         detail: {
            value,
            accepted: value === 'accepted',
         },
      }));
   };

   const getStoredConsent = () => {
      if (!canUseStorage) {
         return '';
      }

      const storedValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

      return storedValue === 'accepted' ? storedValue : '';
   };

   const closeBanner = () => {
      banner.classList.remove('is-visible');

      window.setTimeout(() => {
         banner.hidden = true;
      }, 360);
   };

   const saveConsent = (value) => {
      if (canUseStorage) {
         window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
      }

      syncConsentState(value);
      closeBanner();
   };

   const storedConsent = getStoredConsent();

   if (storedConsent) {
      banner.hidden = true;
      syncConsentState(storedConsent);
      return;
   }

   banner.hidden = false;

   window.requestAnimationFrame(() => {
      banner.classList.add('is-visible');
   });

   acceptButton.addEventListener('click', () => {
      saveConsent('accepted');
   });

   syncConsentState();
};

window.PanoramaCookieConsent = {
   getStatus() {
      try {
         return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) || '';
      } catch (error) {
         return '';
      }
   },
   hasConsent() {
      return this.getStatus() === 'accepted';
   },
};

initCookieBanner();
