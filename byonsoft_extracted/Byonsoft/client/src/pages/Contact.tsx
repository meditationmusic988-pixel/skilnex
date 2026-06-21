import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, Mail, MessageCircle, MapPin, Clock,
  Send, Phone, CheckCircle, Zap
} from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    const text = `Hi Skilnex Support!%0A%0AName: ${encodeURIComponent(form.name)}%0AEmail: ${encodeURIComponent(form.email)}%0ASubject: ${encodeURIComponent(form.subject)}%0A%0AMessage:%0A${encodeURIComponent(form.message)}`;
    window.open(`https://wa.me/923124494267?text=${text}`, "_blank");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0D1626]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
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

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-xs font-semibold mb-5">
            <MessageCircle className="w-3.5 h-3.5" /> Hum Yahan Hain
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Humse <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Baat Karo</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Koi bhi sawaal ho, feedback ho, ya madad chahiye — hum 24/7 available hain.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {[
              {
                icon: <MessageCircle className="w-5 h-5 text-green-400" />,
                bg: "bg-green-500/10 border-green-500/20",
                title: "WhatsApp Support",
                sub: "Sabse fast response",
                value: "+92 312 4494267",
                action: () => window.open("https://wa.me/923124494267", "_blank"),
                btn: "Open WhatsApp",
                btnClass: "bg-green-600 hover:bg-green-500",
              },
              {
                icon: <Mail className="w-5 h-5 text-blue-400" />,
                bg: "bg-blue-500/10 border-blue-500/20",
                title: "Email",
                sub: "Detailed queries ke liye",
                value: "support@skilnex.com",
                action: () => window.open("mailto:support@skilnex.com", "_blank"),
                btn: "Send Email",
                btnClass: "bg-blue-600 hover:bg-blue-500",
              },
              {
                icon: <Clock className="w-5 h-5 text-purple-400" />,
                bg: "bg-purple-500/10 border-purple-500/20",
                title: "Support Hours",
                sub: "Pakistan Standard Time",
                value: "Mon–Sat · 9 AM – 10 PM",
                action: null,
                btn: null,
                btnClass: "",
              },
              {
                icon: <MapPin className="w-5 h-5 text-orange-400" />,
                bg: "bg-orange-500/10 border-orange-500/20",
                title: "Location",
                sub: "Pakistan ka #1 Skill Platform",
                value: "Lahore, Pakistan 🇵🇰",
                action: null,
                btn: null,
                btnClass: "",
              },
            ].map((item, i) => (
              <div key={i} className={`rounded-2xl border ${item.bg} p-5`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} border flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-slate-500 text-xs mb-1">{item.sub}</p>
                    <p className="text-slate-300 text-sm font-medium">{item.value}</p>
                    {item.btn && (
                      <button
                        onClick={item.action!}
                        className={`mt-3 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${item.btnClass}`}
                      >
                        {item.btn}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message Bhej Diya!</h3>
                  <p className="text-slate-400 text-sm mb-6">Hum jaldi se jaldi jawab dein ge. WhatsApp pe bhi message bhej sakte ho.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-blue-400 text-sm hover:underline"
                  >
                    Dobara bhejein
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-6">Message Bhejein</h2>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Aapka Naam *</label>
                        <input
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="e.g. Ali Hassan"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Email *</label>
                        <input
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="ali@gmail.com"
                          type="email"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Subject</label>
                      <input
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="e.g. Payment issue, Course query..."
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Message *</label>
                      <textarea
                        rows={5}
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        placeholder="Apna sawaal ya feedback yahan likhein..."
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!form.name || !form.email || !form.message}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all"
                    >
                      <Send className="w-4 h-4" /> WhatsApp pe Bhejein
                    </button>
                    <p className="text-center text-slate-600 text-xs">
                      Message WhatsApp pe open hoga — aik click mein bhej dein
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-600 text-sm">
          © 2025 Skilnex · Pakistan's #1 Skill Learning Platform
        </div>
      </div>
    </div>
  );
}
