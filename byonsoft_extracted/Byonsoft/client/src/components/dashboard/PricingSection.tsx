import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, X as XIcon, Zap } from "lucide-react";
import { FREE_FEATURES, getPremiumFeatures } from "../../utils/premium";

interface PricingSectionProps {
  price: number;
  totalCourses: number;
  onUpgrade: () => void;
}

export const PricingSection = React.memo(function PricingSection({
  price,
  totalCourses,
  onUpgrade,
}: PricingSectionProps) {
  const premiumFeatures = getPremiumFeatures(totalCourses);

  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-bold text-white">Choose Your Plan</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        {/* Free */}
        <div className="rounded-2xl border border-slate-700/70 bg-slate-800/60 p-5">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
            Free
          </p>
          <p className="text-3xl font-black text-white mb-0.5">Rs. 0</p>
          <p className="text-slate-500 text-xs mb-5">Always free to explore</p>
          <ul className="space-y-2.5 mb-5">
            {FREE_FEATURES.map((f) => (
              <li
                key={f.text}
                className={`flex items-center gap-2.5 text-sm ${
                  f.included ? "text-slate-300" : "text-slate-600 line-through"
                }`}
              >
                {f.included ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XIcon className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                {f.text}
              </li>
            ))}
          </ul>
          <div className="text-center text-slate-500 text-xs font-medium py-2 border border-slate-700 rounded-lg">
            Current Plan
          </div>
        </div>

        {/* Premium */}
        <div
          className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-900/25 via-slate-800/60 to-indigo-900/15 p-5 relative overflow-hidden"
          style={{ boxShadow: "0 0 40px -10px rgba(99,102,241,0.2)" }}
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-400" />
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            BEST VALUE
          </div>
          <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-1">
            Premium
          </p>
          <p className="text-3xl font-black text-white mb-0.5">
            Rs. {price}
            <span className="text-slate-400 text-sm font-normal">/mo</span>
          </p>
          <p className="text-slate-500 text-xs mb-5">
            Unlock everything + giveaway entry
          </p>
          <ul className="space-y-2.5 mb-5">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold h-10 shadow-lg shadow-blue-900/30"
          >
            <Zap className="w-4 h-4 mr-2" /> Upgrade Now
          </Button>
        </div>
      </div>
    </section>
  );
});