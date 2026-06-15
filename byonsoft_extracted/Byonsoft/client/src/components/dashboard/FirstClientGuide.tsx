import React from "react";
import { Button } from "@/components/ui/button";
import { Lock, Rocket } from "lucide-react";

interface Step {
  step: string;
  title: string;
  body: string;
  color: string;
  icon: string;
}

interface FirstClientGuideProps {
  steps: Step[];
  skillLabel: string;
  isPremium: boolean;
  price: number;
  onUpgrade: () => void;
}

export const FirstClientGuide = React.memo(function FirstClientGuide({
  steps,
  skillLabel,
  isPremium,
  price,
  onUpgrade,
}: FirstClientGuideProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 flex items-center justify-center">
          <Rocket className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">How to Get Your First Client</h2>
          {skillLabel && skillLabel !== "Your Skill" && (
            <p className="text-emerald-400 text-xs font-medium">
              Personalized for: {skillLabel}
            </p>
          )}
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-800/50">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

        {/* Steps */}
        <div
          className={`p-5 sm:p-6 space-y-3 transition-all duration-300 ${
            !isPremium ? "blur-[8px] select-none pointer-events-none" : ""
          }`}
        >
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex gap-4 p-4 rounded-xl hover:bg-slate-700/30 transition-colors group"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 text-lg shadow-md`}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-widest">
                  Step {item.step}
                </p>
                <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lock overlay */}
        {!isPremium && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/25 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-bold text-base">Premium Content</p>
              <p className="text-slate-400 text-sm">
                Personalized client guide — unlock karo premium mein
              </p>
            </div>
            <Button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 h-11 text-sm shadow-lg shadow-emerald-900/30"
            >
              🔓 Unlock for Rs. {price} PKR
            </Button>
          </div>
        )}
      </div>
    </section>
  );
});