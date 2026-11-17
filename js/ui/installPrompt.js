let deferredInstallPrompt = null;
let bannerElement = null;

// 1. Capture Chromium-based beforeinstallprompt immediately
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  if (bannerElement && sessionStorage.getItem('pwa_prompt_dismissed') !== 'true') {
    bannerElement.style.display = 'flex';
  }
});

export function initInstallPrompt() {
  bannerElement = document.getElementById('installPromptBanner');
  const installBtn = document.getElementById('installAppBtn');
  const dismissBtn = document.getElementById('dismissInstallBtn');
  const descEl = document.getElementById('installBannerDesc');

  if (!bannerElement) return;

  // Avoid unnecessary UI friction if already running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) return;

  // Respect user preference if dismissed in the active session
  if (localStorage.getItem('pwa_prompt_dismissed') === 'true') return;

  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isFirefoxAndroid = /android/i.test(ua) && /firefox/i.test(ua);

  // 1. Android Chromium flow
  if (deferredInstallPrompt) {
    bannerElement.style.display = 'flex';
  }

  // 2. iOS Safari instructional flow
  if (isIos && isSafari) {
    if (descEl) {
      descEl.textContent = 'Tap the Share button (⎋) and select "Add to Home Screen" (➕).';
    }
    if (installBtn) {
      installBtn.style.display = 'none';
    }
    bannerElement.style.display = 'flex';
  }

  // 3. Firefox Android instructional flow
  if (isFirefoxAndroid) {
    if (descEl) {
      descEl.textContent = 'Tap the address bar install icon or menu (⋮) and select "More" -> "Add to Home screen").';
    }
    if (installBtn) {
      installBtn.style.display = 'none';
    }
    bannerElement.style.display = 'flex';
  }

  if (isFirefoxAndroid || (isIos && isSafari)) {
  setTimeout(() => {
    if (bannerElement) {
      bannerElement.style.display = 'none';
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  }, 10000);
}

  // Handle Chromium programmatic install
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      bannerElement.style.display = 'none';
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    });
  }

  // Handle dismissal
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      bannerElement.style.display = 'none';
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    });
  }
}
