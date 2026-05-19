let deferredPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new Event("pwa-installable"));
  });
}

export function getPWAInstallPrompt() {
  return deferredPrompt;
}

export function clearPWAInstallPrompt() {
  deferredPrompt = null;
}
