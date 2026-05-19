import { useState, useEffect } from "react";
import { getPWAInstallPrompt, clearPWAInstallPrompt } from "@/lib/pwaInstall";

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (getPWAInstallPrompt()) setCanInstall(true);

    const onInstallable = () => setCanInstall(true);
    window.addEventListener("pwa-installable", onInstallable);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setCanInstall(false);
      clearPWAInstallPrompt();
    });

    return () => window.removeEventListener("pwa-installable", onInstallable);
  }, []);

  const promptInstall = async () => {
    const prompt = getPWAInstallPrompt();
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setCanInstall(false);
      clearPWAInstallPrompt();
    }
  };

  return { canInstall, installed, promptInstall };
}
