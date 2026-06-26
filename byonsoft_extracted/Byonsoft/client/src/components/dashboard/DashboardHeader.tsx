import React from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, MessageCircle, Brain, Lock, User, LogOut } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  isPremium: boolean;
  onUpgrade: () => void;
  onAIMentor: () => void;
  onLogout: () => void;
}

export const DashboardHeader = React.memo(function DashboardHeader({
  userName,
  isPremium,
  onUpgrade,
  onAIMentor,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-white/[0.06] bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-900/40">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-white text-sm leading-none tracking-tight">Skilnex</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Pakistan's Skill Platform</p>
          </div>
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-2">
          <Badge
            className={`text-[10px] px-2 py-0.5 font-semibold border ${
              isPremium
                ? "bg-emerald-900/40 text-emerald-300 border-emerald-600/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {isPremium ? "Premium" : "Free"}
          </Badge>

          <a
            href="https://wa.me/923124494267?text=Hi%20Skilnex%20Support!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Support</span>
          </a>

          {isPremium ? (
            <Button
              size="sm"
              onClick={onAIMentor}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 h-8"
            >
              <Brain className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">AI Mentor</span>
              <span className="sm:hidden">AI</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onUpgrade}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 h-8 border border-slate-700"
            >
              <Lock className="w-3 h-3 mr-1" />
              <Brain className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">AI Mentor</span>
            </Button>
          )}

          <Link href="/profile">
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white h-8 px-2.5">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5 text-xs">Profile</span>
            </Button>
          </Link>

          <Button
            size="sm"
            variant="ghost"
            onClick={onLogout}
            className="text-slate-500 hover:text-slate-300 h-8 px-2.5"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
});