import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Props {
  variant?: "banner" | "compact";
}

export function PWAInstallButton({ variant = "banner" }: Props) {
  const { canInstall, installed, promptInstall } = usePWAInstall();

  if (!canInstall || installed) return null;

  if (variant === "compact") {
    return (
      <Button
        data-testid="button-pwa-install"
        onClick={promptInstall}
        size="sm"
        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2"
      >
        <Download className="w-3.5 h-3.5" />
        📲 Install App
      </Button>
    );
  }

  return (
    <div
      data-testid="banner-pwa-install"
      className="relative overflow-hidden rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-900/40 via-slate-800/60 to-blue-900/40 p-4"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 text-xl">
            📲
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Install Byonsoft OS App</p>
            <p className="text-slate-400 text-xs mt-0.5">Add to your home screen for the best experience — no App Store needed!</p>
          </div>
        </div>
        <Button
          data-testid="button-pwa-install"
          onClick={promptInstall}
          className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 shadow-lg shadow-blue-900/30 hover:shadow-blue-800/50 transition-all"
        >
          <Download className="w-4 h-4 mr-2" />
          Install Free App
        </Button>
      </div>
    </div>
  );
}
