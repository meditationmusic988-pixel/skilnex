import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button size="sm" variant="ghost" className="text-slate-400 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <h1 className="text-white font-bold text-lg">Terms & Conditions</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Terms & Conditions for Byonsoft OS</h2>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed text-base">
          Welcome to Byonsoft OS! By accessing or using our platform, you agree to the following terms:
        </p>

        <div className="space-y-5">
          <div className="border border-slate-700/60 rounded-xl p-5 bg-slate-800/40">
            <h3 className="text-white font-semibold text-base mb-3">1. Subscription &amp; Payments</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Byonsoft OS is a premium platform. Access to our complete course library requires a subscription fee (Rs. 750/month). Payments are verified manually via screenshot submission. Account activation may take up to 12–24 hours after submission.
            </p>
          </div>

          <div className="border border-slate-700/60 rounded-xl p-5 bg-slate-800/40">
            <h3 className="text-white font-semibold text-base mb-3">2. User Conduct</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              You agree not to share your account credentials with others or distribute our premium course content (videos, materials) on external platforms. Violation of this will result in an immediate permanent ban without refund.
            </p>
          </div>

          <div className="border border-yellow-700/30 rounded-xl p-5 bg-yellow-900/10">
            <h3 className="text-white font-semibold text-base mb-3">3. Refund Policy</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Due to the digital nature of our courses and instant access to the AI Mentor, <span className="text-yellow-300 font-medium">all subscription payments are final and non-refundable.</span>
            </p>
          </div>

          <div className="border border-slate-700/60 rounded-xl p-5 bg-slate-800/40">
            <h3 className="text-white font-semibold text-base mb-3">4. Intellectual Property</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              All content on Byonsoft OS, including videos, text, and AI tools, is the property of Byonsoft Academy.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-green-900/20 border border-green-700/30 flex items-start gap-3">
          <SiWhatsapp className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <p className="text-green-300 text-sm leading-relaxed">
            For support, message us on WhatsApp:{" "}
            <a
              href="https://wa.me/923124494267"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white transition-colors font-semibold"
            >
              +923124494267
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
