import { Link } from "wouter";
import { ArrowLeft, FileText, Zap, AlertTriangle, CreditCard, BookOpen, Users, Ban, Scale, RefreshCw } from "lucide-react";

const sections = [
  {
    icon: <Users className="w-5 h-5 text-blue-400" />,
    title: "Account aur Registration",
    items: [
      "Skilnex use karne ke liye aapki umar 13 saal ya zyada honi chahiye.",
      "Account register karte waqt accurate information dena zaroori hai.",
      "Aap apne account ki security ke khud zimmedar hain — password kisi ke saath share mat karo.",
      "Ek person ek hi account rakh sakta hai. Duplicate accounts ban ho sakte hain.",
      "Kisi doosre ki identity se account banana strictly prohibited hai.",
    ],
  },
  {
    icon: <CreditCard className="w-5 h-5 text-green-400" />,
    title: "Payment aur Subscription",
    items: [
      "Premium subscription ke liye payment advance mein hoti hai.",
      "Subscription automatically renew nahi hoti — manually aapko renew karna hoga.",
      "Payment successful hone ke baad access 24 hours ke andar activate ho jaata hai.",
      "Refund policy: Payment ke 3 din ke andar request karo — valid issues par refund diya jaata hai.",
      "Giveaway prizes ka koi cash alternative nahi hoga.",
      "Hum prices change karne ka haq rakhte hain — existing subscribers ko advance notice diya jaayega.",
    ],
  },
  {
    icon: <BookOpen className="w-5 h-5 text-purple-400" />,
    title: "Course Content aur Intellectual Property",
    items: [
      "Skilnex ke saare courses, videos, aur materials humari intellectual property hain.",
      "Personal learning ke liye use kar sakte hain — commercially redistribute nahi kar sakte.",
      "Course content record karna, screenshot share karna, ya resell karna strictly banned hai.",
      "AI-generated roadmaps aur assessments aapke personal use ke liye hain.",
      "Kisi bhi content ko bina permission copy karna copyright violation hai.",
    ],
  },
  {
    icon: <Ban className="w-5 h-5 text-red-400" />,
    title: "Prohibited Activities",
    items: [
      "Platform ko hack karna, scrape karna, ya unauthorized access attempt karna.",
      "Doosre users ko harass karna, spam karna, ya inappropriate content share karna.",
      "Account credentials doosron ke saath share karna (one account = one person).",
      "Fake reviews ya giveaway entries submit karna.",
      "Platform ke automated systems ya AI ko manipulate karne ki koshish karna.",
      "Illegal activities ke liye platform use karna.",
    ],
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    title: "Disclaimers aur Limitations",
    items: [
      "Skilnex ek educational platform hai — income guarantee nahi deta.",
      "AI-generated career advice general guidance ke liye hai — professional advice ki jagah nahi le sakti.",
      "Platform uptime 99% ensure karne ki koshish karte hain lekin 100% guarantee nahi.",
      "Third-party links ya tools ke liye hum responsible nahi hain.",
      "Course content regular update hota hai — purana content replace ho sakta hai.",
    ],
  },
  {
    icon: <Scale className="w-5 h-5 text-teal-400" />,
    title: "Account Termination",
    items: [
      "Hum kisi bhi account ko Terms violation par terminate kar sakte hain bina prior notice ke.",
      "Aap khud bhi account delete karne ka request kar sakte hain — support se rabta karein.",
      "Account delete hone par subscription refund nahi milta (pro-rata ke علاوہ).",
      "Banned account se new account banana Terms violation hai.",
    ],
  },
  {
    icon: <RefreshCw className="w-5 h-5 text-orange-400" />,
    title: "Terms mein Changes",
    items: [
      "Hum in Terms ko kabhi bhi update kar sakte hain.",
      "Major changes ke liye email notification ya platform announcement diya jaayega.",
      "Updated Terms accept karna platform continue karne ke liye zaroori hai.",
      "Agar changes se agree nahi toh account close karne ka option hai.",
    ],
  },
];

export default function Terms() {
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
            <FileText className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Conditions</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Skilnex use karne se pehle yeh terms padhein — yeh aapke aur humare beech ka agreement hai.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-slate-600 text-sm">
            <RefreshCw className="w-3.5 h-3.5" />
            Last updated: January 2025
          </div>
        </div>

        {/* Agreement box */}
        <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5 mb-10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-indigo-300 font-semibold text-sm mb-1">Important Notice</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Skilnex pe account banane ya platform use karne se aap in Terms & Conditions se agree karte hain.
                Agar koi term se disagreement ho toh platform use na karein.
              </p>
            </div>
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
                  {section.items.map((item, j) => (
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

        {/* Governing law */}
        <div className="mt-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">Governing Law</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Yeh Terms & Conditions Pakistan ke laws ke mutabiq govern hoti hain.
                Koi bhi dispute Lahore, Pakistan ke courts mein resolve hoga.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 bg-gradient-to-r from-indigo-900/30 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold mb-2">Koi sawaal hai Terms ke baare mein?</h3>
          <p className="text-slate-400 text-sm mb-4">Humse directly rabta karein.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/contact">
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Contact Us
              </button>
            </Link>
            <a
              href="https://wa.me/923124494267"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 mt-8 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-600 text-sm">
          © 2025 Skilnex · Pakistan's #1 Skill Learning Platform ·{" "}
          <Link href="/privacy"><span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span></Link>
        </div>
      </div>
    </div>
  );
}
