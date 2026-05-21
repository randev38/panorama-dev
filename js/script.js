var $ = jQuery;

let residences_wrap_benefits_sw = new Swiper('.residences_wrap_benefits_sw', {
   slidesPerView: 4,
   spaceBetween: 40,
   speed: 800,
   breakpoints: {
      0: {
         slidesPerView: 'auto',
         spaceBetween: 7,
      },
      1200: {
         slidesPerView: 4,
         spaceBetween: 30,
      },
      1600: {
         slidesPerView: 4,
         spaceBetween: 40,
      },
   }
});

let club_wrap_slider_sw = new Swiper('.club_wrap_slider_sw', {
   slidesPerView: 5,
   spaceBetween: 80,
   speed: 800,
   navigation: {
      nextEl: '.club_wrap_slider_btns_next',
      prevEl: '.club_wrap_slider_btns_prev',
   },
   breakpoints: {
      0: {
         slidesPerView: 'auto',
         spaceBetween: 0,
         enabled: false,
      },
      1200: {
         slidesPerView: 5,
         spaceBetween: 40,
         enabled: true,
      },
      1400: {
         slidesPerView: 5,
         spaceBetween: 60,
         enabled: true,
      },
      1600: {
         slidesPerView: 5,
         spaceBetween: 80,
         enabled: true,
      },
   }
});

let resizeTimeout;
let lastWidth = window.innerWidth;

window.addEventListener('resize', () => {
   clearTimeout(resizeTimeout);

   resizeTimeout = setTimeout(() => {
      const currentWidth = window.innerWidth;

      if (currentWidth !== lastWidth) {
         lastWidth = currentWidth;

         if (currentWidth <= 1199) {
            club_wrap_slider_sw.enable();
            club_wrap_slider_sw.slideTo(0, 0);
            club_wrap_slider_sw.disable();
         }
      }
   }, 150);
});

const initHeaderState = () => {
   const header = document.querySelector('.header');

   if (!header) {
      return;
   }

   const toggleHeaderState = () => {
      header.classList.toggle('active', window.scrollY > 0);
   };

   toggleHeaderState();
   window.addEventListener('scroll', toggleHeaderState, { passive: true });
};

initHeaderState();

const initAnchorNavigation = () => {
   const header = document.querySelector('.header');
   const root = document.documentElement;
   const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'))
      .filter((link) => link instanceof HTMLAnchorElement && link.getAttribute('href') !== '#');
   const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
   let frameId = null;

   if (!(header instanceof HTMLElement) || !anchorLinks.length) {
      return;
   }

   const syncHeaderOffset = () => {
      root.style.setProperty('--header-offset', `${header.offsetHeight + 24}px`);
      frameId = null;
   };

   const requestHeaderOffsetSync = () => {
      if (frameId !== null) {
         return;
      }

      frameId = window.requestAnimationFrame(syncHeaderOffset);
   };

   const scrollToHash = (hash, behavior = reducedMotionQuery.matches ? 'auto' : 'smooth') => {
      const targetId = hash.replace(/^#/, '');

      if (!targetId) {
         return false;
      }

      const target = document.getElementById(targetId);

      if (!(target instanceof HTMLElement)) {
         return false;
      }

      requestHeaderOffsetSync();

      window.requestAnimationFrame(() => {
         target.scrollIntoView({
            behavior,
            block: 'start',
         });
      });

      return true;
   };

   anchorLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
         const { hash } = link;

         if (!hash || !scrollToHash(hash)) {
            return;
         }

         event.preventDefault();

         if (window.location.hash !== hash) {
            window.history.pushState(null, '', hash);
         }
      });
   });

   requestHeaderOffsetSync();

   window.addEventListener('load', () => {
      requestHeaderOffsetSync();

      if (window.location.hash) {
         scrollToHash(window.location.hash, 'auto');
      }
   });

   window.addEventListener('resize', requestHeaderOffsetSync);
   window.addEventListener('scroll', requestHeaderOffsetSync, { passive: true });
   window.addEventListener('hashchange', () => {
      if (window.location.hash) {
         scrollToHash(window.location.hash, 'auto');
      }
   });
};

initAnchorNavigation();

const initBurgerMenu = () => {
   const header = document.querySelector('.header');
   const menu = document.querySelector('#burger-menu');
   const burgerButton = document.querySelector('.header_wrap_right_burger');

   if (!(header instanceof HTMLElement) || !(menu instanceof HTMLElement) || !(burgerButton instanceof HTMLButtonElement)) {
      return;
   }

   const closeButtons = Array.from(menu.querySelectorAll('[data-menu-close]'));
   const menuLinks = Array.from(menu.querySelectorAll('a[href^="#"]'));
   const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
   let lastFocusedElement = null;

   const getFocusableElements = () => Array.from(menu.querySelectorAll(focusableSelector))
      .filter((element) => element instanceof HTMLElement && !element.hasAttribute('disabled') && !element.hasAttribute('data-menu-ignore-focus'));

   const setMenuState = (isOpen) => {
      header.classList.toggle('is-menu-open', isOpen);
      menu.classList.toggle('is-open', isOpen);
      menu.setAttribute('aria-hidden', String(!isOpen));
      burgerButton.setAttribute('aria-expanded', String(isOpen));
      burgerButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('menu-open', isOpen);

      if (isOpen) {
         lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
         const [firstFocusableElement] = getFocusableElements();
         firstFocusableElement?.focus();
         return;
      }

      if (lastFocusedElement instanceof HTMLElement) {
         lastFocusedElement.focus();
      }
   };

   burgerButton.addEventListener('click', () => {
      setMenuState(!menu.classList.contains('is-open'));
   });

   closeButtons.forEach((button) => {
      button.addEventListener('click', () => {
         setMenuState(false);
      });
   });

   menuLinks.forEach((link) => {
      link.addEventListener('click', () => {
         setMenuState(false);
      });
   });

   document.addEventListener('keydown', (event) => {
      if (!menu.classList.contains('is-open')) {
         return;
      }

      if (event.key === 'Escape') {
         event.preventDefault();
         setMenuState(false);
         return;
      }

      if (event.key !== 'Tab') {
         return;
      }

      const focusableElements = getFocusableElements();
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

      if (!firstFocusableElement || !lastFocusableElement) {
         return;
      }

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
         event.preventDefault();
         lastFocusableElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastFocusableElement) {
         event.preventDefault();
         firstFocusableElement.focus();
      }
   });

   window.addEventListener('resize', () => {
      if (window.innerWidth > 1199 && menu.classList.contains('is-open')) {
         setMenuState(false);
      }
   });
};

initBurgerMenu();

let cooperation_wrap_sw = new Swiper('.cooperation_wrap_sw', {
   slidesPerView: 5,
   spaceBetween: 40,
   speed: 800,
   breakpoints: {
      0: {
         slidesPerView: 'auto',
         spaceBetween: 7,
      },
      1200: {
         slidesPerView: 'auto',
         spaceBetween: 20,
      },
      1400: {
         slidesPerView: 5,
         spaceBetween: 30,
      },
      1600: {
         slidesPerView: 5,
         spaceBetween: 40,
      },
   }
});

const initClientTabs = () => {
   const clientSections = document.querySelectorAll('.client_wrap');

   clientSections.forEach((section, sectionIndex) => {
      const tabList = section.querySelector('.client_wrap_tabs');
      const tabs = Array.from(section.querySelectorAll('.client_wrap_tabs_tab'));
      const panels = Array.from(section.querySelectorAll('.client_wrap_content_it'));

      if (!tabList || !tabs.length || tabs.length !== panels.length) {
         return;
      }

      tabList.setAttribute('role', 'tablist');

      const setActiveTab = (activeIndex) => {
         tabs.forEach((tab, tabIndex) => {
            const isActive = tabIndex === activeIndex;
            const tabId = `client-tab-${sectionIndex + 1}-${tabIndex + 1}`;
            const panelId = `client-panel-${sectionIndex + 1}-${tabIndex + 1}`;

            tab.type = 'button';
            tab.id = tabId;
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', panelId);
            tab.setAttribute('aria-selected', String(isActive));
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
            tab.classList.toggle('is-active', isActive);

            panels[tabIndex].id = panelId;
            panels[tabIndex].setAttribute('role', 'tabpanel');
            panels[tabIndex].setAttribute('aria-labelledby', tabId);
            panels[tabIndex].setAttribute('aria-hidden', String(!isActive));
            panels[tabIndex].classList.toggle('is-active', isActive);
            panels[tabIndex].classList.toggle('is-hidden', !isActive);
         });
      };

      tabs.forEach((tab, tabIndex) => {
         tab.addEventListener('click', () => {
            setActiveTab(tabIndex);
         });

         tab.addEventListener('keydown', (event) => {
            let nextIndex = null;

            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
               nextIndex = (tabIndex + 1) % tabs.length;
            }

            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
               nextIndex = (tabIndex - 1 + tabs.length) % tabs.length;
            }

            if (event.key === 'Home') {
               nextIndex = 0;
            }

            if (event.key === 'End') {
               nextIndex = tabs.length - 1;
            }

            if (nextIndex === null) {
               return;
            }

            event.preventDefault();
            setActiveTab(nextIndex);
            tabs[nextIndex].focus();
         });
      });

      setActiveTab(0);
   });
};

initClientTabs();


const initCallbackModal = () => {
   const modal = document.querySelector('#callback-modal');

   if (!modal) {
      return;
   }

   const form = modal.querySelector('.modal__form');
   const status = modal.querySelector('[data-modal-status]');
   const phoneInput = modal.querySelector('[data-phone-input]');
   const modalTitle = modal.querySelector('#callback-modal-title');
   const closeButtons = modal.querySelectorAll('[data-modal-close]');
   const openButtons = document.querySelectorAll('.js-modal-trigger');
   const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
   const defaultModalTitle = modalTitle?.textContent?.trim() || 'Стать партнером';

   const setStatus = (message = '', state = '') => {
      if (!status) {
         return;
      }

      status.textContent = message;
      status.classList.remove('is-error', 'is-success');

      if (state) {
         status.classList.add(`is-${state}`);
      }
   };

   const getPhoneDigits = (value = '') => {
      let digits = value.replace(/\D/g, '');

      if (digits.startsWith('7') || digits.startsWith('8')) {
         digits = digits.slice(1);
      }

      return digits.slice(0, 10);
   };

   const formatPhone = (value = '') => {
      const digits = getPhoneDigits(value);
      const parts = ['+7'];

      if (digits.length > 0) {
         parts.push(` (${digits.slice(0, 3)}`);
      }

      if (digits.length >= 4) {
         parts.push(`) ${digits.slice(3, 6)}`);
      }

      if (digits.length >= 7) {
         parts.push(`-${digits.slice(6, 8)}`);
      }

      if (digits.length >= 9) {
         parts.push(`-${digits.slice(8, 10)}`);
      }

      return parts.join('');
   };

   const clearValidationState = () => {
      form?.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
         field.setAttribute('aria-invalid', 'false');
      });
      setStatus();
   };

   const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('body-scroll-lock');

   };

   const openModal = (trigger) => {
      if (modalTitle) {
         modalTitle.textContent = trigger?.dataset?.modalTitle?.trim() || defaultModalTitle;
      }

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('body-scroll-lock');
      clearValidationState();

      window.setTimeout(() => {
         const firstField = modal.querySelector('input, textarea');

         if (firstField instanceof HTMLElement) {
            firstField.focus();
         }
      }, 50);
   };

   openButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
         event.preventDefault();
         openModal(button);
      });
   });

   closeButtons.forEach((button) => {
      button.addEventListener('click', () => {
         closeModal();
      });
   });

   modal.addEventListener('click', (event) => {
      if (event.target === modal) {
         closeModal();
      }
   });

   document.addEventListener('keydown', (event) => {
      if (!modal.classList.contains('is-open')) {
         return;
      }

      if (event.key === 'Escape') {
         event.preventDefault();
         closeModal();
      }

      if (event.key !== 'Tab') {
         return;
      }

      const focusableElements = Array.from(modal.querySelectorAll(focusableSelector))
         .filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');

      if (!focusableElements.length) {
         return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
         event.preventDefault();
         lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
         event.preventDefault();
         firstElement.focus();
      }
   });

   if (phoneInput instanceof HTMLInputElement) {
      phoneInput.addEventListener('focus', () => {
         if (!phoneInput.value.trim()) {
            phoneInput.value = '+7';
         }
      });

      phoneInput.addEventListener('input', () => {
         phoneInput.value = formatPhone(phoneInput.value);
         phoneInput.setAttribute('aria-invalid', 'false');
         setStatus();
      });

      phoneInput.addEventListener('blur', () => {
         if (getPhoneDigits(phoneInput.value).length === 0) {
            phoneInput.value = '';
         }
      });
   }

   form?.addEventListener('input', (event) => {
      const field = event.target;

      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
         field.setAttribute('aria-invalid', 'false');
         setStatus();
      }
   });

   form?.addEventListener('submit', (event) => {
      event.preventDefault();

      const nameInput = form.querySelector('input[name="name"]');
      const agencyInput = form.querySelector('input[name="agency"]');
      const digits = phoneInput instanceof HTMLInputElement ? getPhoneDigits(phoneInput.value) : '';
      let hasError = false;

      clearValidationState();

      if (nameInput instanceof HTMLInputElement && !nameInput.value.trim()) {
         nameInput.setAttribute('aria-invalid', 'true');
         hasError = true;
      }

      if (phoneInput instanceof HTMLInputElement && digits.length !== 10) {
         phoneInput.setAttribute('aria-invalid', 'true');
         hasError = true;
      }

      if (agencyInput instanceof HTMLInputElement && !agencyInput.value.trim()) {
         agencyInput.setAttribute('aria-invalid', 'true');
         hasError = true;
      }

      if (hasError) {
         setStatus('Заполните все поля и проверьте телефон.', 'error');
         return;
      }

      form.reset();

      if (phoneInput instanceof HTMLInputElement) {
         phoneInput.setAttribute('aria-invalid', 'false');
      }

      setStatus('Спасибо! Мы получили заявку и скоро свяжемся с вами.', 'success');

      window.setTimeout(() => {
         closeModal();
         setStatus();
      }, 1800);
   });
};

initCallbackModal();

const initSectionRevealAnimations = () => {
   const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
   const revealConfig = [
      { section: '.first', selectors: ['.first_wrap > *'] },
      { section: '.residences', selectors: ['.residences_wrap > *'] },
      { section: '.club', selectors: ['.club_wrap > *'] },
      { section: '.years', selectors: ['.years_wrap .row > *'] },
      { section: '.cooperation', selectors: ['.cooperation_wrap > *'] },
      { section: '.scheme', selectors: ['.scheme_wrap > *'] },
      { section: '.client', selectors: ['.client_wrap > *'] },
      { section: '.material', selectors: ['.material_wrap > *'] },
   ];

   const sections = revealConfig
      .map(({ section, selectors }) => {
         const element = document.querySelector(section);

         if (!(element instanceof HTMLElement)) {
            return null;
         }

         const items = selectors
            .flatMap((selector) => Array.from(element.querySelectorAll(selector)))
            .filter((item, index, collection) => item instanceof HTMLElement && collection.indexOf(item) === index);

         if (!items.length) {
            return null;
         }

         element.classList.add('section-reveal');

         items.forEach((item, index) => {
            item.classList.add('section-reveal-item');
            item.style.setProperty('--reveal-delay', `${index * 0.12}s`);
         });

         return element;
      })
      .filter(Boolean);

   if (!sections.length) {
      return;
   }

   if (reducedMotionQuery.matches || !('IntersectionObserver' in window)) {
      sections.forEach((section) => {
         section.classList.add('is-visible');
      });
      return;
   }

   const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
         if (!entry.isIntersecting) {
            return;
         }

         entry.target.classList.add('is-visible');
         observer.unobserve(entry.target);
      });
   }, {
      threshold: 0.22,
      rootMargin: '0px 0px -8% 0px',
   });

   sections.forEach((section) => {
      observer.observe(section);
   });
};

initSectionRevealAnimations();


let trend_swiper = new Swiper('.trend_swiper', {
   slidesPerView: 1,
   spaceBetween: 0,
   speed: 800,
   grabCursor: true,
   loop: true,
   effect: 'fade',
   fadeEffect: {
      crossFade: true
   },
   navigation: {
      nextEl: '.trend_swiper_btns_next',
      prevEl: '.trend_swiper_btns_prev',
   },
});

let economy_wrap_swiper = new Swiper('.economy_wrap_swiper', {
   slidesPerView: 1,
   spaceBetween: 0,
   speed: 800,
   grabCursor: true,
   loop: true,
   autoHeight: true,
   effect: 'fade',
   fadeEffect: {
      crossFade: true
   },
   navigation: {
      nextEl: '.economy_wrap_swiper_btns_next',
      prevEl: '.economy_wrap_swiper_btns_prev',
   },
});
