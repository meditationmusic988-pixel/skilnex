import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, CheckCircle, Lock, Zap, AlertCircle, RefreshCw, Upload, ImageIcon, X, Tag, Loader2 } from "lucide-react";
import type { PaymentSetting } from "@shared/schema";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [trxId, setTrxId] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponSaving, setCouponSaving] = useState(0);
  const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error">("idle");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const { data: paymentMethods = [], isLoading: methodsLoading, isError: methodsError, refetch: refetchMethods } = useQuery<PaymentSetting[]>({
    queryKey: ["/api/payment-methods"],
    staleTime: 0,
    retry: 3,
  });

  const { data: priceSetting } = useQuery<{ subscription_price: number }>({
    queryKey: ["/api/settings/price"],
  });
  const basePrice = priceSetting?.subscription_price ?? 750;
  const finalPrice = appliedCoupon ? basePrice - couponSaving : basePrice;

  const selectedDetails = paymentMethods.find((m) => m.method_name === selectedMethod);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 10MB", variant: "destructive" });
      return;
    }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshotBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearScreenshot = () => {
    setScreenshotBase64("");
    setScreenshotName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setTrxId("");
    setSelectedMethod("");
    clearScreenshot();
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponSaving(0);
    setCouponStatus("idle");
    setCouponError("");
  };

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponStatus("idle");
    setCouponError("");
    try {
      const res = await apiRequest("POST", "/api/validate-coupon", { code });
      if (!res.ok) {
        const err = await res.json();
        setCouponStatus("error");
        setCouponError(err.error || "Invalid Promo Code");
        setAppliedCoupon(null);
        setCouponSaving(0);
      } else {
        const data = await res.json();
        setAppliedCoupon(code.toUpperCase());
        setCouponSaving(data.saving);
        setCouponStatus("success");
      }
    } catch {
      setCouponStatus("error");
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponSaving(0);
    setCouponStatus("idle");
    setCouponError("");
    setCouponInput("");
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/submit-payment", {
        method: selectedMethod,
        trx_id: trxId || "N/A",
        screenshot_url: screenshotBase64,
        coupon_code: appliedCoupon || "",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-transactions"] });
      resetForm();
      onClose();
      setLocation("/success");
    },
    onError: (err: any) => {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    },
  });

  const canSubmit = selectedMethod && screenshotBase64 && !submitMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Zap className="w-5 h-5 text-yellow-400" />
            Upgrade to Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Plan card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-bold text-lg">Monthly Plan</p>
                <p className="text-slate-400 text-sm">Full access to all courses & AI tools</p>
              </div>
              <div className="text-right">
                {appliedCoupon ? (
                  <>
                    <p className="text-slate-400 text-sm line-through">Rs. {basePrice}</p>
                    <p className="text-3xl font-bold text-green-400">Rs. {finalPrice}</p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-white">Rs. {basePrice}</p>
                )}
                <p className="text-slate-400 text-xs">per month</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["All Courses", "AI Career Mentor", "Skill Assessment", "Certificates"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div>
            <Label className="text-slate-300 mb-2 block">Select Payment Method</Label>
            {methodsLoading ? (
              <div className="space-y-2" data-testid="payment-methods-loading">
                <Skeleton className="h-10 w-full bg-slate-700" />
              </div>
            ) : methodsError ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-900/20 border border-red-700/30" data-testid="payment-methods-error">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm flex-1">Failed to load payment methods.</p>
                <Button size="sm" variant="ghost" className="text-red-400 h-7 px-2" onClick={() => refetchMethods()}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Retry
                </Button>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/30" data-testid="payment-methods-empty">
                <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-yellow-300 text-sm">No payment methods configured. Please contact admin.</p>
              </div>
            ) : (
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger data-testid="select-payment-method" className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Choose payment method..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {paymentMethods.map((m) => (
                    <SelectItem key={m.id} value={m.method_name} className="text-white">{m.method_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Account details */}
          {selectedDetails && (
            <div className="bg-slate-700/60 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <p className="text-white font-medium text-sm">{selectedDetails.method_name} Details</p>
              </div>
              <p className="text-slate-300 text-sm font-mono whitespace-pre-line">{selectedDetails.account_details}</p>
              <Badge className="mt-2 bg-green-900/40 text-green-300 border-green-600/30">
                Send Rs. {finalPrice} to this account
              </Badge>
            </div>
          )}

          {/* Screenshot Upload (required) */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-1.5">
              Payment Screenshot <span className="text-red-400">*</span>
              <span className="text-slate-500 text-xs font-normal">(required for verification)</span>
            </Label>

            {screenshotBase64 ? (
              <div className="relative rounded-lg overflow-hidden border border-green-500/30 bg-slate-700/40">
                <img src={screenshotBase64} alt="Payment screenshot" className="w-full max-h-48 object-contain" />
                <button
                  onClick={clearScreenshot}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-600/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="px-3 py-2 bg-slate-800/90 border-t border-slate-600/40 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-green-300 text-xs truncate">{screenshotName}</p>
                </div>
              </div>
            ) : (
              <button
                data-testid="button-upload-screenshot"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-600 hover:border-blue-500/60 rounded-lg p-6 flex flex-col items-center gap-3 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                  <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                </div>
                <div className="text-center">
                  <p className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                    <Upload className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    Upload Payment Screenshot
                  </p>
                  <p className="text-slate-500 text-xs mt-1">PNG, JPG, JPEG up to 10MB</p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-testid="input-screenshot-file"
            />
          </div>

          {/* Optional TXID */}
          <div className="space-y-2">
            <Label className="text-slate-300">Transaction ID / Reference <span className="text-slate-500 text-xs">(optional)</span></Label>
            <Input
              data-testid="input-trx-id"
              placeholder="Enter TRX ID or reference number (optional)..."
              className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
            />
            <p className="text-slate-500 text-xs">After sending Rs. {finalPrice}, upload the screenshot above for verification</p>
          </div>

          {/* ─── Coupon Code ─────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              Promo / Coupon Code <span className="text-slate-500 text-xs">(optional)</span>
            </Label>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-900/20 border border-green-600/40 rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <div>
                    <p data-testid="text-coupon-success" className="text-green-300 text-sm font-semibold">
                      Promo Applied! You saved {couponSaving} PKR. Your new total is {finalPrice} PKR.
                    </p>
                    <p className="text-green-500 text-xs">Code: {appliedCoupon}</p>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-slate-400 hover:text-red-400 transition-colors ml-2 shrink-0"
                  data-testid="button-remove-coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  data-testid="input-coupon-code"
                  placeholder="Enter Coupon Code (e.g., BYONSOFT500)"
                  className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500 uppercase"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    if (couponStatus !== "idle") { setCouponStatus("idle"); setCouponError(""); }
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") applyCoupon(); }}
                />
                <Button
                  data-testid="button-apply-coupon"
                  type="button"
                  onClick={applyCoupon}
                  disabled={!couponInput.trim() || couponLoading}
                  className="bg-purple-700 hover:bg-purple-600 text-white shrink-0 px-4"
                >
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
            )}

            {couponStatus === "error" && (
              <p data-testid="text-coupon-error" className="text-red-400 text-sm flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {couponError}
              </p>
            )}
          </div>

          {/* ─── Order Summary ────────────────────────────────────────────────── */}
          <div className="bg-slate-700/40 rounded-lg border border-slate-600/60 px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Standard Price</span>
              <span className="text-white">Rs. {basePrice}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Promo Discount ({appliedCoupon})</span>
                <span className="text-green-400">- Rs. {couponSaving}</span>
              </div>
            )}
            <div className="border-t border-slate-600 pt-1.5 flex justify-between font-bold">
              <span className="text-white">Total Payable</span>
              <span className={appliedCoupon ? "text-green-400 text-lg" : "text-white text-lg"}>Rs. {finalPrice}</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            data-testid="button-submit-payment"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-500 hover:to-blue-600 transition-all"
            disabled={!canSubmit}
            onClick={() => submitMutation.mutate()}
          >
            {submitMutation.isPending ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              <><CheckCircle className="w-4 h-4 mr-2" /> Submit Payment — Rs. {finalPrice}</>
            )}
          </Button>

          {!screenshotBase64 && (
            <p className="text-center text-yellow-400 text-xs flex items-center justify-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Please upload your payment screenshot to continue
            </p>
          )}

          <div className="flex items-center gap-2 justify-center text-slate-500 text-xs">
            <Lock className="w-3 h-3" />
            <span>Your payment will be verified within 24 hours by admin</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
