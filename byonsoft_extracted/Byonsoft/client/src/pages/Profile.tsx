import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/UpgradeModal";
import { User, Mail, CreditCard, Clock, CheckCircle, XCircle, ArrowLeft, Zap, Shield } from "lucide-react";
import type { Transaction } from "@shared/schema";

const statusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<any> }> = {
  pending:  { label: "Pending Approval", className: "bg-yellow-900/40 text-yellow-300 border-yellow-600/30", icon: Clock },
  approved: { label: "Approved",         className: "bg-green-900/40 text-green-300 border-green-600/30",   icon: CheckCircle },
  rejected: { label: "Rejected",         className: "bg-red-900/40 text-red-300 border-red-600/30",         icon: XCircle },
};

export default function Profile() {
  const { user } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/my-transactions"],
  });

  const subStatus = user?.subscription_status
    ? { label: "Active", className: "bg-green-900/40 text-green-300 border-green-600/30" }
    : transactions.some((t) => t.status === "pending")
    ? { label: "Pending Approval", className: "bg-yellow-900/40 text-yellow-300 border-yellow-600/30" }
    : { label: "Inactive", className: "bg-red-900/40 text-red-300 border-red-600/30" };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button size="sm" variant="ghost" className="text-slate-400 gap-2">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
          <h1 className="text-white font-bold text-lg">My Profile</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile Card */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 data-testid="text-profile-name" className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span data-testid="text-profile-email">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge data-testid="badge-subscription-status" className={subStatus.className}>
                    {subStatus.label}
                  </Badge>
                  {user?.role === "admin" && (
                    <Badge className="bg-red-900/40 text-red-300 border-red-600/30">
                      <Shield className="w-3 h-3 mr-1" /> Admin
                    </Badge>
                  )}
                </div>
              </div>
              {!user?.subscription_status && (
                <Button
                  data-testid="button-upgrade-profile"
                  onClick={() => setUpgradeOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-900/30 hover:shadow-blue-800/50 transition-shadow"
                >
                  <Zap className="w-4 h-4 mr-2" /> Upgrade Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <CreditCard className="w-4 h-4 text-blue-400" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/40 border border-slate-600/60">
              <span className="text-slate-400 text-sm">Account Type</span>
              <span className="text-white font-medium text-sm">{user?.subscription_status ? "Premium Member" : "Free Account"}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/40 border border-slate-600/60">
              <span className="text-slate-400 text-sm">Status</span>
              <Badge className={subStatus.className}>{subStatus.label}</Badge>
            </div>
            {user?.subscription_status && user?.subscription_expiry_date && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-900/20 border border-green-700/40">
                <span className="text-slate-400 text-sm">Valid Until</span>
                <span data-testid="text-expiry-date" className="text-green-300 font-semibold text-sm">
                  {new Date(user.subscription_expiry_date).toLocaleDateString("en-PK", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }).replace(/\//g, "-")}
                </span>
              </div>
            )}
            {!user?.subscription_status && (
              <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
                <p className="text-blue-300 text-sm">
                  Upgrade to Premium to unlock all courses, AI Career Mentor, and skill assessments.
                </p>
                <Button
                  size="sm"
                  onClick={() => setUpgradeOpen(true)}
                  className="mt-2 bg-blue-600 text-white"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" /> Upgrade to Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-purple-400" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-slate-700/40 animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400 text-sm">No payment history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const sc = statusConfig[tx.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <div
                      key={tx.id}
                      data-testid={`row-transaction-${tx.id}`}
                      className="p-4 rounded-lg bg-slate-700/40 border border-slate-600/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-600/60 flex items-center justify-center shrink-0">
                            <StatusIcon className={`w-4 h-4 ${tx.status === "approved" ? "text-green-400" : tx.status === "rejected" ? "text-red-400" : "text-yellow-400"}`} />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{tx.method}</p>
                            <p className="text-slate-400 text-xs font-mono">{tx.trx_id || "No TRX ID"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-sm">Rs. {tx.amount}</p>
                          <Badge className={`text-xs mt-1 ${sc.className}`}>{sc.label}</Badge>
                        </div>
                      </div>
                      {tx.created_at && (
                        <p className="text-slate-500 text-xs mt-2">
                          {new Date(tx.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
