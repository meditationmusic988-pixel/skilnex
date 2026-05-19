import { useLocation } from "wouter";
import { CheckCircle, ArrowRight, MessageCircle } from "lucide-react";

const WA_LINK =
  "https://wa.me/923124494267?text=Hello,%20I%20have%20just%20paid%20Rs.750%20for%20Byonsoft%20OS.%20Here%20is%20my%20screenshot.";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#080E1A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-700/15 blur-[120px]" />
        <div className="absolute -top-24 -right-24 w-[350px] h-[350px] rounded-full bg-blue-700/10 blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-[300px] h-[300px] rounded-full bg-violet-700/10 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute inset-2 rounded-full bg-emerald-400/10 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.4s" }} />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shadow-2xl shadow-emerald-900/50">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0D1626]/80 backdrop-blur-sm shadow-2xl p-8 sm:p-10">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Payment Received
          </div>

          <h1
            data-testid="heading-success"
            className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight"
          >
            Payment Received Successfully!
          </h1>

          <p
            data-testid="text-pending"
            className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8"
          >
            Your account is currently{" "}
            <span className="text-yellow-400 font-semibold">pending approval</span>. We are
            verifying your transaction. This usually takes{" "}
            <span className="text-white font-medium">a few hours</span>.
          </p>

          {/* WhatsApp primary CTA */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="button-whatsapp-cta"
            className="group flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-base sm:text-lg px-6 py-4 rounded-xl transition-all duration-200 shadow-2xl shadow-emerald-900/40 hover:shadow-emerald-800/50 mb-4"
          >
            {/* WhatsApp SVG */}
            <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.47.644 4.887 1.87 7.01L2 30l7.19-1.888A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.538a11.51 11.51 0 0 1-5.88-1.612l-.42-.25-4.27 1.12 1.14-4.15-.274-.428A11.503 11.503 0 0 1 4.46 16.003c0-6.367 5.178-11.544 11.543-11.544 6.366 0 11.543 5.177 11.543 11.544 0 6.366-5.177 11.535-11.543 11.535zm6.326-8.642c-.347-.174-2.054-1.015-2.374-1.13-.318-.116-.55-.174-.78.174-.23.347-.895 1.13-1.098 1.362-.202.23-.405.26-.752.087-.347-.174-1.466-.54-2.793-1.724-1.033-.92-1.73-2.057-1.932-2.404-.203-.347-.022-.535.152-.708.158-.155.347-.405.52-.607.174-.202.232-.347.347-.578.116-.232.058-.434-.029-.607-.087-.174-.78-1.88-1.07-2.575-.28-.676-.566-.584-.78-.595l-.664-.01c-.23 0-.607.086-.924.434-.318.347-1.214 1.187-1.214 2.893 0 1.707 1.243 3.356 1.416 3.588.174.232 2.446 3.732 5.927 5.235.828.357 1.474.57 1.978.73.83.264 1.587.227 2.183.137.666-.1 2.054-.84 2.345-1.652.29-.81.29-1.506.203-1.652-.086-.145-.318-.23-.665-.404z" />
            </svg>
            <span>Send Screenshot on WhatsApp for Fast Activation</span>
            <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform shrink-0" />
          </a>

          {/* Helper text below WhatsApp button */}
          <p className="text-slate-600 text-xs mb-6">
            Send your payment screenshot on WhatsApp for same-day activation
          </p>

          {/* Secondary button */}
          <button
            data-testid="button-go-dashboard"
            onClick={() => setLocation("/dashboard")}
            className="group flex items-center justify-center gap-2 w-full border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
          </button>
        </div>

        {/* Bottom reassurance */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            Support: wa.me/923124494267
          </span>
          <span>·</span>
          <span>Byonsoft@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
