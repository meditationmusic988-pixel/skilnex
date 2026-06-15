import React from "react";
import { Link } from "wouter";
import { GraduationCap, Phone, Shield, FileText } from "lucide-react";

export const DashboardFooter = React.memo(function DashboardFooter() {
  return (
    <footer className="border-t border-white/[0.05] bg-slate-900/60 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Skilnex</p>
              <p className="text-slate-500 text-xs">Pakistan's #1 Skill Platform</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-5 text-slate-400 text-sm">
            <Link
              href="/contact"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Contact
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" /> Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Terms
            </Link>
          </nav>

          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} Skilnex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});