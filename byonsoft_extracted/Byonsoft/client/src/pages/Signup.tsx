import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Lock, Mail, User, Gift, Phone } from "lucide-react";
import { PWAInstallButton } from "@/components/PWAInstallButton";

export default function Signup() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", whatsapp: "" });

  const refCode = new URLSearchParams(search).get("ref") ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        whatsapp_number: form.whatsapp,
        ...(refCode ? { ref: refCode } : {}),
      });
      const data = await res.json();
      login(data.token, data.user);
      toast({ title: "Account created!", description: "Welcome to Skilnex OS" });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Skilnex OS</h1>
          <p className="text-slate-400 mt-1">Start Your Learning Journey</p>
        </div>

        <PWAInstallButton variant="banner" />

        <Card className="border-slate-700 bg-slate-800/60 backdrop-blur-sm shadow-2xl mt-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Create Account</CardTitle>
            <CardDescription className="text-slate-400">Join thousands of students learning high-income skills</CardDescription>
            {refCode && (
              <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-yellow-900/30 border border-yellow-600/40">
                <Gift className="w-4 h-4 text-yellow-400 shrink-0" />
                <p className="text-yellow-300 text-xs">You were invited by a friend — sign up now to get started together!</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300" htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="name"
                    data-testid="input-name"
                    type="text"
                    placeholder="Ali Hassan"
                    className="pl-10 bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300" htmlFor="whatsapp">WhatsApp Number <span className="text-red-400">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="whatsapp"
                    data-testid="input-whatsapp"
                    type="tel"
                    placeholder="e.g., 03XXXXXXXXX"
                    className="pl-10 bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    required
                  />
                </div>
                <p className="text-slate-500 text-xs">Used for order updates &amp; payment confirmation only</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300" htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    data-testid="input-signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300" htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    data-testid="input-signup-password"
                    type="password"
                    placeholder="Min 6 characters"
                    className="pl-10 bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300" htmlFor="confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirm"
                    data-testid="input-confirm-password"
                    type="password"
                    placeholder="Repeat password"
                    className="pl-10 bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button
                data-testid="button-signup"
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{" "}
                <button
                  data-testid="link-login"
                  onClick={() => setLocation("/login")}
                  className="text-blue-400 font-medium cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
