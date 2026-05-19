import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, MessageCircle, Clock, MapPin } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button size="sm" variant="ghost" className="text-slate-400 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <h1 className="text-white font-bold text-lg">Contact Us</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-900/30">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Get in Touch</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Have a question, issue, or want to learn more about Byonsoft OS? We're here to help.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Email */}
          <Card className="bg-slate-800/60 border-slate-700 hover:border-blue-500/40 transition-colors group">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Email us at</p>
                <p className="text-white font-semibold">Byonsoft@gmail.com</p>
              </div>
              <a href="mailto:Byonsoft@gmail.com" className="w-full">
                <Button
                  data-testid="button-email-contact"
                  variant="outline"
                  className="w-full border-blue-500/40 text-blue-300 hover:bg-blue-600/20 hover:border-blue-400"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card className="bg-slate-800/60 border-slate-700 hover:border-green-500/40 transition-colors group">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-600/20 border border-green-500/30 flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                <SiWhatsapp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Chat with us on</p>
                <p className="text-white font-semibold">WhatsApp</p>
              </div>
              <a href="https://wa.me/923124494267" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button
                  data-testid="button-whatsapp-contact"
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold"
                >
                  <SiWhatsapp className="w-4 h-4 mr-2" />
                  Chat on WhatsApp
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <Clock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium text-sm">Response Time</p>
              <p className="text-slate-400 text-sm">We typically respond within 24 hours on business days.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium text-sm">Based in Pakistan</p>
              <p className="text-slate-400 text-sm">Serving students across Pakistan and beyond.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
