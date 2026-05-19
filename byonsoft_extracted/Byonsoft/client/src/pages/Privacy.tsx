import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button size="sm" variant="ghost" className="text-slate-400 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <h1 className="text-white font-bold text-lg">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Privacy Policy for Byonsoft OS</h2>
            <p className="text-slate-400 text-sm">Effective Date: March 2026</p>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed text-base">
          Welcome to Byonsoft OS. Your privacy is critically important to us.
        </p>

        <div className="space-y-5">
          <div className="border border-slate-700/60 rounded-xl p-5 bg-slate-800/40">
            <h3 className="text-white font-semibold text-base mb-3">1. Information We Collect</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We collect basic account information (Name, Email) and payment proof (Screenshots/Transaction IDs) to activate your premium subscription. We do not store any credit card or sensitive banking data on our servers.
            </p>
          </div>

          <div className="border border-slate-700/60 rounded-xl p-5 bg-slate-800/40">
            <h3 className="text-white font-semibold text-base mb-3">2. How We Use Your Data</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your information is strictly used to provide you access to our 50+ premium courses, AI Mentor features, and to communicate with you regarding your account.
            </p>
          </div>

          <div className="border border-slate-700/60 rounded-xl p-5 bg-slate-800/40">
            <h3 className="text-white font-semibold text-base mb-3">3. Data Protection</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We implement industry-standard security measures to ensure your data is safe from unauthorized access.
            </p>
          </div>

          <div className="border border-slate-700/60 rounded-xl p-5 bg-slate-800/40">
            <h3 className="text-white font-semibold text-base mb-3">4. Third-Party Sharing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Byonsoft OS does not sell, trade, or rent your personal information to any third party.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-blue-900/20 border border-blue-700/30 flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-300 text-sm leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:Byonsoft@gmail.com" className="underline underline-offset-2 hover:text-white transition-colors font-medium">
              Byonsoft@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
