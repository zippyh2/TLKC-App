let deferredInstallPrompt = null;

export function initInstallPrompt() {
  const banner = document.getElementById('installPromptBanner');
  const installBtn = document.getElementById('installAppBtn');
  const dismissBtn = document.getElementById('dismissInstallBtn');
  const descEl = document.getElementById('installBannerDesc');

  if (!banner) return;

  // Do not prompt if already running as an installed PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) return;

  // Check if previously dismissed in this session
  if (sessionStorage.getItem('pwa_prompt_dismissed') === 'true') return;

  // 1. Android / Chromium: capture beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    banner.style.display = 'flex';
  });

  // 2. iOS Safari detection
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);

  if (isIos && isSafari && !isStandalone) {
    if (descEl) {
      descEl.textContent = 'Tap the Share button (⎋) and select "Add to Home Screen" (➕).';
    }
    if (installBtn) {
      installBtn.style.display = 'none'; // iOS requires manual Share menu step
    }
    banner.style.display = 'flex';
  }

  // Handle Install button click (Android)
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      banner.style.display = 'none';
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('User installed the PWA');
      }
      deferredInstallPrompt = null;
    });
  }

  // Handle Dismiss button click
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      banner.style.display = 'none';
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    });
  }
}
