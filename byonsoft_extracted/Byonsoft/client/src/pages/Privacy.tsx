import { Link } from "wouter";
import { ArrowLeft, Shield, Zap, Eye, Lock, Database, UserCheck, Mail, RefreshCw } from "lucide-react";

const sections = [
  {
    icon: <Database className="w-5 h-5 text-blue-400" />,
    title: "Hum Kya Information Collect Karte Hain",
    content: [
      "Account information: Naam, email address, aur password jab aap register karte hain.",
      "Profile data: Aapki skill assessment results, course progress, aur learning preferences.",
      "Usage data: Aap Skilnex ko kaise use karte hain — konse courses dekhe, kitna time spend kiya.",
      "Payment information: Subscription ke liye payment details (hum card numbers store nahi karte — yeh third-party processor handle karta hai).",
      "Device information: Browser type, IP address, aur device type for security purposes.",
    ],
  },
  {
    icon: <Eye className="w-5 h-5 text-purple-400" />,
    title: "Hum Information Kaise Use Karte Hain",
    content: [
      "Aapko personalized AI career roadmap aur course recommendations dene ke liye.",
      "Platform improve karne aur new features add karne ke liye.",
      "Aapke account ki security ensure karne ke liye.",
      "Support queries handle karne ke liye.",
      "Giveaway aur competitions manage karne ke liye.",
      "Important platform updates aur announcements bhejne ke liye.",
    ],
  },
  {
    icon: <Lock className="w-5 h-5 text-green-400" />,
    title: "Data Security",
    content: [
      "Aapka data encrypted connections (HTTPS) ke zariye transmit hota hai.",
      "Passwords hashed form mein store hote hain — hum kabhi plain text password nahi rakhte.",
      "Regular security audits kiye jaate hain.",
      "Unauthorized access se bachne ke liye industry-standard security measures use karte hain.",
      "Koi bhi data breach hone ki soorat mein hum aapko 72 hours ke andar notify karein ge.",
    ],
  },
  {
    icon: <UserCheck className="w-5 h-5 text-orange-400" />,
    title: "Third-Party Sharing",
    content: [
      "Hum aapka personal data kabhi bhi advertisers ko sell nahi karte.",
      "Payment processing ke liye trusted third-party processors use karte hain.",
      "Analytics ke liye anonymized data use hota hai — koi personally identifiable information nahi.",
      "Legal requirements hone par Pakistani law enforcement ke saath cooperate karte hain.",
    ],
  },
  {
    icon: <RefreshCw className="w-5 h-5 text-teal-400" />,
    title: "Aapke Rights",
    content: [
      "Access: Aap apna stored data dekh sakte hain profile settings mein.",
      "Correction: Galat information ko update kar sakte hain.",
      "Deletion: Account delete karne ka request kar sakte hain — sab data permanently remove ho jaata hai.",
      "Export: Apna data download karne ka request kar sakte hain.",
      "Opt-out: Marketing emails se unsubscribe kar sakte hain anytime.",
    ],
  },
  {
    icon: <Mail className="w-5 h-5 text-pink-400" />,
    title: "Cookies",
    content: [
      "Hum essential cookies use karte hain jo platform ko properly kaam karne dete hain.",
      "Session cookies aapko logged in rakhte hain.",
      "Preference cookies aapki settings yaad rakhte hain.",
      "Analytics cookies (anonymized) se hum platform improve karte hain.",
      "Aap browser settings se cookies block kar sakte hain, lekin kuch features kaam nahi karein ge.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0D1626]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">Skilnex</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Policy</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Aapki privacy humari priority hai. Yahan clearly bataya gaya hai ke hum aapka data kaise handle karte hain.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-slate-600 text-sm">
            <RefreshCw className="w-3.5 h-3.5" />
            Last updated: January 2025
          </div>
        </div>

        {/* Quick summary */}
        <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-6 mb-10">
          <h2 className="text-blue-300 font-bold text-sm uppercase tracking-widest mb-3">TL;DR — Short Version</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: "🔒", text: "Aapka data kabhi sell nahi karte" },
              { icon: "✅", text: "Data sirf platform improve karne ke liye" },
              { icon: "🗑️", text: "Request pe data permanently delete" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-blue-900/20 rounded-xl p-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800/60">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                  {section.icon}
                </div>
                <h2 className="text-white font-bold">{section.title}</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {section.content.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/20 rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold mb-2">Privacy se related koi sawaal?</h3>
          <p className="text-slate-400 text-sm mb-4">Humse directly baat karo — hum jaldi jawab dete hain.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="https://wa.me/923124494267"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              WhatsApp Karo
            </a>
            <a
              href="mailto:support@skilnex.com"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Email Bhejein
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 mt-8 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-600 text-sm">
          © 2025 Skilnex · Pakistan's #1 Skill Learning Platform
        </div>
      </div>
    </div>
  );
}
