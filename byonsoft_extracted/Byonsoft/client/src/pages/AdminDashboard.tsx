import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toEmbedUrl } from "@/lib/youtube";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users, BookOpen, CreditCard, BarChart3, Check, X, Trash2, Edit3,
  Plus, LogOut, Shield, ChevronRight, RefreshCw, Settings, FolderOpen, Eye,
  Download, Share2, ToggleLeft, ToggleRight, UserCheck, TrendingUp, Gift, Tag,
  Zap, Brain, Upload, CheckCircle2, AlertCircle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { GiveawayManagerWidget } from "@/components/GiveawayBanner";
import type { Course, Lesson, PaymentSetting, User, Coupon } from "@shared/schema";

interface ReferralUserRow {
  id: number; name: string; email: string; referral_code: string;
  subscription_status: boolean; referred_by_name: string | null;
  referral_bonus_count: number;
  total_referrals: number; successful_referrals: number; premium_conversions: number;
}

interface TxWithUser {
  id: number; user_id: number; amount: string; method: string;
  trx_id: string; status: string; created_at: string;
  user_name: string; user_email: string; screenshot_url: string;
}

// ── FIX 1: module_name added to fetchedLessons ──
interface BulkImportState {
  courseTitle: string;
  driveFolderUrl: string;
  moduleName: string;
  generatedCategory: string;
  generatedDescription: string;
  generatedTags: string;
  fetchedLessons: { title: string; video_url: string; module_name: string }[];
  step: "idle" | "generating" | "fetching" | "preview" | "importing" | "done";
  error: string;
}

const INITIAL_BULK: BulkImportState = {
  courseTitle: "",
  driveFolderUrl: "",
  moduleName: "",
  generatedCategory: "",
  generatedDescription: "",
  generatedTags: "",
  fetchedLessons: [],
  step: "idle",
  error: "",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [courseDialog, setCourseDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ title: "", category: "", description: "", tags: "" });
  const [editPayment, setEditPayment] = useState<PaymentSetting | null>(null);
  const [paymentDetails, setPaymentDetails] = useState("");
  const [lessonCourse, setLessonCourse] = useState<Course | null>(null);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", video_url: "", module_name: "" });
  const [priceInput, setPriceInput] = useState<string>("");
  const [driveUrl, setDriveUrl] = useState("");
  const [driveModuleName, setDriveModuleName] = useState("");
  const [driveDrafts, setDriveDrafts] = useState<{ title: string; video_url: string; module_name: string }[]>([]);
  const [driveFetching, setDriveFetching] = useState(false);
  const [screenshotTx, setScreenshotTx] = useState<TxWithUser | null>(null);
  const [editBonusDialog, setEditBonusDialog] = useState(false);
  const [editBonusUser, setEditBonusUser] = useState<{ id: number; name: string; bonus: number } | null>(null);
  const [bonusInput, setBonusInput] = useState("0");
  const [referralEnabled, setReferralEnabled] = useState(true);
  const [referralRules, setReferralRules] = useState(
    JSON.stringify([
      { threshold: 1, label: "Bonus Lesson", icon: "📚" },
      { threshold: 3, label: "Free Premium Week", icon: "⭐" },
      { threshold: 5, label: "Extra Giveaway Ticket", icon: "🎟️" },
      { threshold: 10, label: "Free 1-Month Premium", icon: "👑" },
    ], null, 2)
  );
  const [referralSearch, setReferralSearch] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponPrice, setCouponPrice] = useState("");
  const [couponDesc, setCouponDesc] = useState("");

  // ── Bulk Import State ──
  const [bulk, setBulk] = useState<BulkImportState>(INITIAL_BULK);
  const updateBulk = (patch: Partial<BulkImportState>) => setBulk(prev => ({ ...prev, ...patch }));

  const { data: users = [], refetch: refetchUsers } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const { data: courses = [], refetch: refetchCourses } = useQuery<Course[]>({ queryKey: ["/api/admin/courses"] });
  const { data: paymentSettings = [] } = useQuery<PaymentSetting[]>({ queryKey: ["/api/admin/payment-settings"] });
  const { data: transactions = [], refetch: refetchTx } = useQuery<TxWithUser[]>({ queryKey: ["/api/admin/transactions"] });

  const { data: referralData = [], refetch: refetchReferrals } = useQuery<ReferralUserRow[]>({
    queryKey: ["/api/admin/referrals"],
    queryFn: async () => {
      const token = localStorage.getItem("byonsoft_token");
      const r = await fetch("/api/admin/referrals", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      return Array.isArray(d) ? d : [];
    },
  });
  const { data: referralSettings, refetch: refetchReferralSettings } = useQuery<{ referral_enabled: boolean; referral_reward_rules: string }>({
    queryKey: ["/api/admin/referrals/settings"],
    queryFn: async () => {
      const token = localStorage.getItem("byonsoft_token");
      const r = await fetch("/api/admin/referrals/settings", { headers: { Authorization: `Bearer ${token}` } });
      return r.json();
    },
  });

  const { data: coupons = [], refetch: refetchCoupons } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  const createCoupon = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/coupons", {
        coupon_code: couponCode.trim().toUpperCase(),
        custom_price: Number(couponPrice),
        description: couponDesc.trim(),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setCouponCode(""); setCouponPrice(""); setCouponDesc("");
      toast({ title: "Coupon created!" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Coupon deleted" });
    },
  });

  const adjustBonus = useMutation({
    mutationFn: async ({ userId, bonus }: { userId: number; bonus: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/referrals/${userId}/bonus`, { bonus });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      setEditBonusDialog(false);
      toast({ title: "Referral bonus updated!" });
    },
  });

  const saveReferralSettings = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/admin/referrals/settings", {
        referral_enabled: referralEnabled,
        referral_reward_rules: referralRules,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals/settings"] });
      toast({ title: "Referral settings saved!" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const exportReferralCSV = async () => {
    const token = localStorage.getItem("byonsoft_token");
    const r = await fetch("/api/admin/referrals/export", { headers: { Authorization: `Bearer ${token}` } });
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "byonsoft-referrals.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const { data: priceSetting } = useQuery<{ subscription_price: number }>({
    queryKey: ["/api/settings/price"],
  });

  useEffect(() => {
    if (referralSettings) {
      setReferralEnabled(referralSettings.referral_enabled ?? true);
      if (referralSettings.referral_reward_rules) {
        try { setReferralRules(JSON.stringify(JSON.parse(referralSettings.referral_reward_rules), null, 2)); } catch { }
      }
    }
  }, [referralSettings]);

  useEffect(() => {
    if (priceSetting && !priceInput) setPriceInput(String(priceSetting.subscription_price));
  }, [priceSetting]);

  const { data: courseLessons = [] } = useQuery<Lesson[]>({
    queryKey: [`/api/admin/courses/${lessonCourse?.id}/lessons`],
    enabled: !!lessonCourse,
  });

  const pendingTx = transactions.filter((t) => t.status === "pending");

  // ── FIX 2 & 3: Bulk Import — module_name from subfolder preserved ──
  const handleBulkGenerate = async () => {
    if (!bulk.courseTitle.trim()) {
      toast({ title: "Course title required", variant: "destructive" });
      return;
    }
    if (!bulk.driveFolderUrl.trim()) {
      toast({ title: "Drive folder URL required", variant: "destructive" });
      return;
    }

    updateBulk({ step: "generating", error: "" });

    try {
      // Step 1: AI generate course details
    const aiRes = await apiRequest("POST", "/api/admin/bulk-import/generate-meta", {
  title: bulk.courseTitle.trim(),
});
const aiData = await aiRes.json();
if (!aiRes.ok) throw new Error(aiData.error || "AI generation failed");
const parsed = {
  category: aiData.category || "Freelancing & Agency",
  description: aiData.description || `${bulk.courseTitle} course.`,
  tags: aiData.tags || "",
};
  // Step 1: AI generate course meta
  try {
      // Step 1: AI generate course meta
      const aiRes = await apiRequest("POST", "/api/admin/bulk-import/generate-meta", {
        title: bulk.courseTitle.trim(),
      });
      const aiData = await aiRes.json();
      if (!aiRes.ok) throw new Error(aiData.error || "AI generation failed");
      const parsed = {
        category: aiData.category || "Freelancing & Agency",
        description: aiData.description || `${bulk.courseTitle} course.`,
        tags: aiData.tags || "",
      };

      updateBulk({
        generatedCategory: parsed.category ...

      updateBulk({
        generatedCategory: parsed.category || "Freelancing & Agency",
        generatedDescription: parsed.description || `${bulk.courseTitle} course.`,
        generatedTags: parsed.tags || "",
        step: "fetching",
      });

      // Step 2: Fetch Drive lessons — module_name from subfolder
      const driveRes = await apiRequest("GET", `/api/admin/drive/import?folderUrl=${encodeURIComponent(bulk.driveFolderUrl.trim())}`);
      const driveData = await driveRes.json();
      if (!driveRes.ok) throw new Error(driveData.error || "Drive fetch failed");

      // FIX: module_name field preserve karo (subfolder name)
      const lessons = (driveData.lessons as { title: string; video_url: string; module_name: string }[]) || [];

      updateBulk({
        fetchedLessons: lessons,
        step: "preview",
      });

      if (lessons.length === 0) {
        toast({ title: "No videos found in folder", variant: "destructive" });
        updateBulk({ step: "idle" });
      }
    } catch (err: any) {
      updateBulk({ step: "idle", error: err.message || "Something went wrong" });
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleBulkImport = async () => {
    if (!bulk.generatedCategory || bulk.fetchedLessons.length === 0) return;
    updateBulk({ step: "importing" });

    try {
      // Create course
      const courseRes = await apiRequest("POST", "/api/admin/courses", {
        title: bulk.courseTitle.trim(),
        category: bulk.generatedCategory,
        description: bulk.generatedDescription,
        tags: bulk.generatedTags,
      });
      const newCourse = await courseRes.json();

      // FIX: har lesson ki apni module_name use karo (subfolder se)
      for (let i = 0; i < bulk.fetchedLessons.length; i++) {
        await apiRequest("POST", `/api/admin/courses/${newCourse.id}/lessons`, {
          title: bulk.fetchedLessons[i].title,
          video_url: bulk.fetchedLessons[i].video_url,
          module_name: bulk.fetchedLessons[i].module_name || bulk.moduleName.trim() || "Module 1",
          order_index: i,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });

      updateBulk({ step: "done" });
      toast({ title: `Course created with ${bulk.fetchedLessons.length} lessons!` });
    } catch (err: any) {
      updateBulk({ step: "preview", error: err.message });
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    }
  };

  const updateTxStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/transactions/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: vars.status === "approved" ? "Payment Approved!" : "Payment Rejected" });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/users/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "User deleted" }); },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/role`, { role });
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "Role updated" }); },
  });

  const toggleSubscription = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/subscription`, { subscription_status: status });
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/giveaway/stats"] });
      toast({ title: vars.status ? "Subscription activated" : "Subscription deactivated" });
    },
  });

  const saveCourse = useMutation({
    mutationFn: async () => {
      if (editCourse) {
        const res = await apiRequest("PATCH", `/api/admin/courses/${editCourse.id}`, {
          title: courseForm.title,
          category: courseForm.category,
          description: courseForm.description,
          tags: courseForm.tags,
        });
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/admin/courses", courseForm);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setCourseDialog(false); setEditCourse(null);
      setCourseForm({ title: "", category: "", description: "", tags: "" });
      toast({ title: editCourse ? "Course updated!" : "Course created!" });
    },
  });

  const saveLesson = useMutation({
    mutationFn: async () => {
      if (!lessonCourse) return;
      const normalizedForm = { ...lessonForm, video_url: toEmbedUrl(lessonForm.video_url) };
      if (editLesson) {
        const res = await apiRequest("PATCH", `/api/admin/lessons/${editLesson.id}`, normalizedForm);
        return res.json();
      } else {
        const nextIndex = courseLessons.length;
        const res = await apiRequest("POST", `/api/admin/courses/${lessonCourse.id}/lessons`, { ...normalizedForm, order_index: nextIndex });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${lessonCourse?.id}/lessons`] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${lessonCourse?.id}/lessons`] });
      setEditLesson(null);
      setLessonForm({ title: "", video_url: "", module_name: "" });
      toast({ title: editLesson ? "Lesson updated!" : "Lesson added!" });
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/lessons/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${lessonCourse?.id}/lessons`] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${lessonCourse?.id}/lessons`] });
      toast({ title: "Lesson deleted" });
    },
  });

  async function fetchDriveLessons() {
    if (!driveUrl.trim()) return;
    if (!driveModuleName.trim()) {
      toast({ title: "Module Name required", variant: "destructive" });
      return;
    }
    setDriveFetching(true);
    try {
      const res = await apiRequest("GET", `/api/admin/drive/import?folderUrl=${encodeURIComponent(driveUrl.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch from Google Drive");
      const drafts = (data.lessons as { title: string; video_url: string; module_name: string }[]).map((l) => ({
        ...l,
        module_name: l.module_name || driveModuleName.trim(),
      }));
      setDriveDrafts(drafts);
      if (drafts.length === 0) toast({ title: "No files found" });
    } catch (err: any) {
      toast({ title: "Drive Fetch Failed", description: err.message, variant: "destructive" });
    } finally {
      setDriveFetching(false);
    }
  }

  const bulkImportDrive = useMutation({
    mutationFn: async () => {
      if (!lessonCourse || driveDrafts.length === 0) return;
      const baseIndex = courseLessons.length;
      for (let i = 0; i < driveDrafts.length; i++) {
        await apiRequest("POST", `/api/admin/courses/${lessonCourse.id}/lessons`, { ...driveDrafts[i], order_index: baseIndex + i });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${lessonCourse?.id}/lessons`] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${lessonCourse?.id}/lessons`] });
      const count = driveDrafts.length;
      setDriveDrafts([]); setDriveUrl(""); setDriveModuleName("");
      toast({ title: `${count} lessons imported!` });
    },
    onError: (err: any) => toast({ title: "Import failed", description: err.message, variant: "destructive" }),
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/courses/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Course deleted" });
    },
  });

  const savePayment = useMutation({
    mutationFn: async () => {
      if (!editPayment) return;
      const res = await apiRequest("PATCH", `/api/admin/payment-settings/${editPayment.id}`, { account_details: paymentDetails });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      setEditPayment(null);
      toast({ title: "Payment details updated!" });
    },
  });

  const savePrice = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/admin/settings/price", { subscription_price: parseInt(priceInput, 10) });
      return res.json();
    },
    onSuccess: (data: { subscription_price: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/price"] });
      setPriceInput(String(data.subscription_price));
      toast({ title: "Price updated!", description: `New price: Rs. ${data.subscription_price}/month` });
    },
    onError: (err: any) => toast({ title: "Failed to update price", description: err.message, variant: "destructive" }),
  });

  useEffect(() => {
    if (!user || user.role !== "admin") setLocation("/login");
  }, [user]);

  if (!user || user.role !== "admin") return null;

  const openCourseEdit = (c: Course) => {
    setEditCourse(c);
    setCourseForm({ title: c.title, category: c.category, description: c.description, tags: c.tags ?? "" });
    setCourseDialog(true);
  };

  const openLessonManager = (c: Course) => {
    setLessonCourse(c); setEditLesson(null);
    setLessonForm({ title: "", video_url: "", module_name: "" });
    setLessonDialog(true);
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-900/40 text-yellow-300 border-yellow-600/30",
    approved: "bg-green-900/40 text-green-300 border-green-600/30",
    rejected: "bg-red-900/40 text-red-300 border-red-600/30",
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white leading-none">Super Admin</p>
              <p className="text-slate-500 text-xs">Skilnex Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingTx.length > 0 && (
              <Badge className="bg-red-900/60 text-red-300 border-red-600/30">{pendingTx.length} Pending</Badge>
            )}
            <Button size="sm" variant="ghost" onClick={logout} className="text-slate-400">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length, icon: Users, color: "text-blue-400" },
            { label: "Courses", value: courses.length, icon: BookOpen, color: "text-green-400" },
            { label: "Pending Payments", value: pendingTx.length, icon: CreditCard, color: "text-yellow-400" },
            { label: "Active Subscribers", value: users.filter((u) => u.subscription_status).length, icon: BarChart3, color: "text-purple-400" },
          ].map((s) => (
            <Card key={s.label} className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-slate-400 text-xs">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8"><GiveawayManagerWidget /></div>

        <Tabs defaultValue="transactions">
          <TabsList className="bg-slate-800 border-slate-700 mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-700 text-slate-300">
              Transactions {pendingTx.length > 0 && <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-1.5">{pendingTx.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-700 text-slate-300">Users</TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-slate-700 text-slate-300">Courses</TabsTrigger>
            <TabsTrigger value="bulk-import" className="data-[state=active]:bg-slate-700 text-slate-300">
              <Zap className="w-4 h-4 mr-1.5 text-yellow-400" />Bulk Import
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-slate-700 text-slate-300">Payment Settings</TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-slate-700 text-slate-300">
              <Gift className="w-4 h-4 mr-1.5" />Referrals
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700 text-slate-300">
              <Settings className="w-4 h-4 mr-1.5" />Settings
            </TabsTrigger>
            <TabsTrigger value="coupons" className="data-[state=active]:bg-slate-700 text-slate-300">
              <Tag className="w-4 h-4 mr-1.5" />Coupons
            </TabsTrigger>
          </TabsList>

          {/* ── TRANSACTIONS TAB ── */}
          <TabsContent value="transactions">
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-white">Payment Transactions</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => refetchTx()} className="text-slate-400"><RefreshCw className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">User</TableHead>
                        <TableHead className="text-slate-400">Method / TRX ID</TableHead>
                        <TableHead className="text-slate-400">Screenshot</TableHead>
                        <TableHead className="text-slate-400">Amount</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id} className={`border-slate-700 ${tx.status === "pending" ? "bg-yellow-900/5" : ""}`}>
                          <TableCell>
                            <p className="text-white text-sm font-medium">{tx.user_name}</p>
                            <p className="text-slate-400 text-xs">{tx.user_email}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-slate-300 text-sm">{tx.method}</p>
                            <p className="text-slate-500 text-xs font-mono">{tx.trx_id}</p>
                          </TableCell>
                          <TableCell>
                            {tx.screenshot_url ? (
                              <button onClick={() => setScreenshotTx(tx)} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs font-medium group">
                                <div className="w-10 h-8 rounded border border-slate-600 overflow-hidden bg-slate-700 group-hover:border-blue-500/60">
                                  <img src={tx.screenshot_url} alt="Payment" className="w-full h-full object-cover" />
                                </div>
                                <Eye className="w-3 h-3" />
                              </button>
                            ) : <span className="text-slate-600 text-xs italic">No screenshot</span>}
                          </TableCell>
                          <TableCell className="text-green-400 text-sm font-medium">Rs. {tx.amount}</TableCell>
                          <TableCell><Badge className={`text-xs ${statusColor[tx.status]}`}>{tx.status}</Badge></TableCell>
                          <TableCell>
                            {tx.status === "pending" && (
                              <div className="flex gap-1.5">
                                <Button size="sm" className="bg-green-700 hover:bg-green-600 text-white h-7 px-2 text-xs" disabled={updateTxStatus.isPending} onClick={() => updateTxStatus.mutate({ id: tx.id, status: "approved" })}>
                                  <Check className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" disabled={updateTxStatus.isPending} onClick={() => updateTxStatus.mutate({ id: tx.id, status: "rejected" })}>
                                  <X className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">No transactions yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── USERS TAB ── */}
          <TabsContent value="users">
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-white">Registered Users</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => refetchUsers()} className="text-slate-400"><RefreshCw className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Name</TableHead>
                        <TableHead className="text-slate-400">Email</TableHead>
                        <TableHead className="text-slate-400">WhatsApp</TableHead>
                        <TableHead className="text-slate-400">Role</TableHead>
                        <TableHead className="text-slate-400">Subscription</TableHead>
                        <TableHead className="text-slate-400">Expiry</TableHead>
                        <TableHead className="text-slate-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className="border-slate-700">
                          <TableCell className="text-white font-medium text-sm">{u.name}</TableCell>
                          <TableCell className="text-slate-300 text-sm">{u.email}</TableCell>
                          <TableCell className="text-slate-300 text-sm">
                            {(u as any).whatsapp_number ? (
                              <a href={`https://wa.me/${((u as any).whatsapp_number as string).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 font-mono text-xs">
                                {(u as any).whatsapp_number}
                              </a>
                            ) : <span className="text-slate-600 text-xs">—</span>}
                          </TableCell>
                          <TableCell>
                            <Badge className={u.role === "admin" ? "bg-red-900/40 text-red-300 border-red-600/30" : "bg-slate-700 text-slate-300"}>{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={u.subscription_status ? "bg-green-900/40 text-green-300 border-green-600/30" : "bg-slate-700 text-slate-400"}>
                              {u.subscription_status ? "Active" : "Free"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400 text-xs font-mono">
                            {(u as any).subscription_expiry_date ? new Date((u as any).subscription_expiry_date).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" }) : <span className="text-slate-700">—</span>}
                          </TableCell>
                          <TableCell>
                            {u.email !== user.email && (
                              <div className="flex gap-2 flex-wrap">
                                <Button size="sm" variant="ghost" disabled={toggleSubscription.isPending} className={`h-7 px-2 text-xs font-medium ${u.subscription_status ? "text-red-400 hover:bg-red-900/30" : "text-green-400 hover:bg-green-900/30"}`} onClick={() => toggleSubscription.mutate({ id: u.id, status: !u.subscription_status })}>
                                  {u.subscription_status ? "Mark Free" : "Mark Paid"}
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-slate-400 text-xs" onClick={() => updateRole.mutate({ id: u.id, role: u.role === "admin" ? "user" : "admin" })}>Toggle Admin</Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400" onClick={() => deleteUser.mutate(u.id)}><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── COURSES TAB ── */}
          <TabsContent value="courses">
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-white">Manage Courses</CardTitle>
                <Button size="sm" className="bg-blue-600 text-white" onClick={() => { setEditCourse(null); setCourseForm({ title: "", category: "", description: "", tags: "" }); setCourseDialog(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Course
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-slate-700/40 border border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{c.title}</p>
                          <p className="text-slate-400 text-xs">{c.category}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-purple-400 text-xs" onClick={() => openLessonManager(c)}>
                            <BookOpen className="w-3 h-3 mr-1" /> Lessons
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-400" onClick={() => openCourseEdit(c)}><Edit3 className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400" onClick={() => deleteCourse.mutate(c.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── BULK IMPORT TAB ── */}
          <TabsContent value="bulk-import">
            <div className="space-y-6">
              {/* Header card */}
              <Card className="bg-gradient-to-br from-yellow-900/30 via-slate-800/60 to-slate-800/60 border-yellow-500/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg mb-1">AI Bulk Course Import</h2>
                      <p className="text-slate-400 text-sm">Course title likho + Drive folder link do → AI sab kuch automatically generate karega!</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {["AI Category Generate", "AI Description", "AI Tags", "Auto Chapters", "Auto Lessons", "Ek Click Save"].map(f => (
                          <span key={f} className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 1: Input */}
              {(bulk.step === "idle" || bulk.step === "generating" || bulk.step === "fetching") && (
                <Card className="bg-slate-800/60 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                      Course Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-slate-300 mb-2 block">Course Title <span className="text-red-400">*</span></Label>
                      <Input
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="e.g. Complete Freelancing Masterclass"
                        value={bulk.courseTitle}
                        onChange={e => updateBulk({ courseTitle: e.target.value })}
                        disabled={bulk.step !== "idle"}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300 mb-2 block">Google Drive Folder URL <span className="text-red-400">*</span></Label>
                      <Input
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="https://drive.google.com/drive/folders/..."
                        value={bulk.driveFolderUrl}
                        onChange={e => updateBulk({ driveFolderUrl: e.target.value })}
                        disabled={bulk.step !== "idle"}
                      />
                      <p className="text-slate-500 text-xs mt-1">
                        Folder public honi chahiye — Share → Anyone with link → Viewer
                        <span className="text-blue-400 ml-2">• Subfolders = Auto Chapters ban jayenge</span>
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-300 mb-2 block">
                        Default Module Name
                        <span className="text-slate-500 text-xs ml-2">(sirf tab use hoga jab subfolders na hon)</span>
                      </Label>
                      <Input
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="e.g. Module 1 (subfolders hain to auto set ho ga)"
                        value={bulk.moduleName}
                        onChange={e => updateBulk({ moduleName: e.target.value })}
                        disabled={bulk.step !== "idle"}
                      />
                    </div>

                    {bulk.error && (
                      <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-300 text-sm">{bulk.error}</p>
                      </div>
                    )}

                    <Button
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-yellow-500 hover:to-orange-400 text-white font-bold py-3"
                      disabled={!bulk.courseTitle.trim() || !bulk.driveFolderUrl.trim() || bulk.step !== "idle"}
                      onClick={handleBulkGenerate}
                    >
                      {bulk.step === "generating" ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> AI Category & Description Generate Ho Raha Hai...</>
                      ) : bulk.step === "fetching" ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Drive Se Videos Fetch Ho Rahi Hain...</>
                      ) : (
                        <><Brain className="w-4 h-4 mr-2" /> Generate & Import Preview</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Preview */}
              {bulk.step === "preview" && (
                <div className="space-y-4">
                  {/* AI Generated Info */}
                  <Card className="bg-slate-800/60 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        AI Generated Course Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-slate-400 text-xs mb-1 block">Course Title</Label>
                        <Input className="bg-slate-700 border-slate-600 text-white" value={bulk.courseTitle} onChange={e => updateBulk({ courseTitle: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs mb-1 block">Category (AI Generated)</Label>
                        <Input className="bg-slate-700 border-green-500/30 text-green-300" value={bulk.generatedCategory} onChange={e => updateBulk({ generatedCategory: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs mb-1 block">Description (AI Generated)</Label>
                        <Textarea className="bg-slate-700 border-green-500/30 text-green-300 resize-none" rows={3} value={bulk.generatedDescription} onChange={e => updateBulk({ generatedDescription: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-xs mb-1 block">Tags (AI Generated)</Label>
                        <Input className="bg-slate-700 border-green-500/30 text-green-300" value={bulk.generatedTags} onChange={e => updateBulk({ generatedTags: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* ── FIX 4: Lessons grouped by Chapter/Module ── */}
                  <Card className="bg-slate-800/60 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        {bulk.fetchedLessons.length} Lessons —&nbsp;
                        <span className="text-slate-400 font-normal text-sm">
                          {Array.from(new Set(bulk.fetchedLessons.map(l => l.module_name))).length} Chapters
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
                        {/* Group lessons by module_name (chapter) */}
                        {Array.from(new Set(bulk.fetchedLessons.map(l => l.module_name))).map((chapterName, chIdx) => {
                          const chapterLessons = bulk.fetchedLessons
                            .map((l, i) => ({ ...l, origIdx: i }))
                            .filter(l => l.module_name === chapterName);
                          return (
                            <div key={chIdx}>
                              {/* Chapter header */}
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-700">
                                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                                  {chIdx + 1}
                                </span>
                                <span className="text-blue-300 text-sm font-semibold flex-1">{chapterName}</span>
                                <span className="text-slate-500 text-xs">{chapterLessons.length} lessons</span>
                              </div>
                              {/* Lessons in this chapter */}
                              <div className="space-y-1.5 ml-8">
                                {chapterLessons.map((lesson, li) => (
                                  <div key={lesson.origIdx} className="flex items-center gap-2 p-2 bg-slate-700/40 border border-slate-600 rounded-lg">
                                    <span className="text-slate-500 text-xs w-4 shrink-0">{li + 1}</span>
                                    <Input
                                      className="bg-transparent border-none text-white text-sm h-7 p-0 focus:ring-0 flex-1"
                                      value={lesson.title}
                                      onChange={e => updateBulk({
                                        fetchedLessons: bulk.fetchedLessons.map((l, j) =>
                                          j === lesson.origIdx ? { ...l, title: e.target.value } : l
                                        )
                                      })}
                                    />
                                    <Button
                                      size="sm" variant="ghost"
                                      className="h-6 w-6 p-0 text-red-400 shrink-0"
                                      onClick={() => updateBulk({
                                        fetchedLessons: bulk.fetchedLessons.filter((_, j) => j !== lesson.origIdx)
                                      })}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button variant="ghost" className="text-slate-400 border border-slate-700" onClick={() => updateBulk({ step: "idle", fetchedLessons: [], error: "" })}>
                      ← Back
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold py-3"
                      onClick={handleBulkImport}
                      disabled={bulk.fetchedLessons.length === 0}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Sab Save Karo — Course + {bulk.fetchedLessons.length} Lessons
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Importing */}
              {bulk.step === "importing" && (
                <Card className="bg-slate-800/60 border-slate-700">
                  <CardContent className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-900/50 border-t-blue-500 animate-spin mx-auto" />
                    <p className="text-white font-bold">Course aur Lessons save ho rahe hain...</p>
                    <p className="text-slate-400 text-sm">Thora wait karo — {bulk.fetchedLessons.length} lessons upload ho rahi hain</p>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Done */}
              {bulk.step === "done" && (
                <Card className="bg-gradient-to-br from-green-900/30 to-slate-800/60 border-green-500/30">
                  <CardContent className="py-12 text-center space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                    <h3 className="text-white font-bold text-xl">Course Successfully Import Ho Gaya! 🎉</h3>
                    <p className="text-slate-400">"{bulk.courseTitle}" — {bulk.fetchedLessons.length} lessons ke saath</p>
                    <div className="flex gap-3 justify-center mt-4">
                      <Button className="bg-blue-600 text-white" onClick={() => setBulk(INITIAL_BULK)}>
                        <Plus className="w-4 h-4 mr-2" /> Naya Course Import Karo
                      </Button>
                      <Button variant="ghost" className="text-slate-400 border border-slate-700" onClick={() => { setBulk(INITIAL_BULK); refetchCourses(); }}>
                        Courses Dekho
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ── PAYMENT SETTINGS TAB ── */}
          <TabsContent value="payments">
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader><CardTitle className="text-white">Payment Receiving Details</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentSettings.map((p) => (
                    <div key={p.id} className="p-4 rounded-lg bg-slate-700/40 border border-slate-600">
                      {editPayment?.id === p.id ? (
                        <div className="space-y-3">
                          <p className="text-white font-medium">{p.method_name}</p>
                          <Textarea value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} className="bg-slate-600/60 border-slate-500 text-white text-sm resize-none" rows={3} />
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 text-white" onClick={() => savePayment.mutate()} disabled={savePayment.isPending}>{savePayment.isPending ? "Saving..." : "Save"}</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditPayment(null)} className="text-slate-400">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-white font-medium mb-1">{p.method_name}</p>
                            <p className="text-slate-300 text-sm font-mono">{p.account_details}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-blue-400 shrink-0" onClick={() => { setEditPayment(p); setPaymentDetails(p.account_details); }}><Edit3 className="w-4 h-4" /></Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SETTINGS TAB ── */}
          <TabsContent value="settings">
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-400" />Pricing Strategy</CardTitle>
                <p className="text-slate-400 text-sm">Monthly subscription price set karo.</p>
              </CardHeader>
              <CardContent>
                <div className="max-w-sm space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Monthly Price (Rs.)</Label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Rs.</span>
                        <Input type="number" min={1} className="bg-slate-700 border-slate-600 text-white pl-10" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} />
                      </div>
                      <Button className="bg-blue-600 text-white" disabled={savePrice.isPending || !priceInput || parseInt(priceInput, 10) < 1} onClick={() => savePrice.mutate()}>
                        {savePrice.isPending ? "Saving..." : "Save Price"}
                      </Button>
                    </div>
                  </div>
                  {priceSetting && (
                    <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/30">
                      <p className="text-green-300 text-sm">Current price: <span className="font-bold">Rs. {priceSetting.subscription_price}/month</span></p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── REFERRALS TAB ── */}
          <TabsContent value="referrals" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Referred", value: referralData.reduce((a, u) => a + u.total_referrals, 0), icon: <Users className="w-5 h-5 text-blue-400" /> },
                { label: "Successful", value: referralData.reduce((a, u) => a + u.successful_referrals, 0), icon: <UserCheck className="w-5 h-5 text-green-400" /> },
                { label: "Premium Conversions", value: referralData.reduce((a, u) => a + u.premium_conversions, 0), icon: <TrendingUp className="w-5 h-5 text-yellow-400" /> },
                { label: "Active Referrers", value: referralData.filter(u => u.total_referrals > 0).length, icon: <Share2 className="w-5 h-5 text-purple-400" /> },
              ].map(stat => (
                <Card key={stat.label} className="bg-slate-800 border-slate-700 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">{stat.icon}</div>
                  <div><div className="text-2xl font-bold text-white">{stat.value}</div><div className="text-xs text-slate-400">{stat.label}</div></div>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-800 border-slate-700 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-lg">Referral Program Settings</h3>
                  <p className="text-slate-400 text-sm">Reward tiers control karo</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${referralEnabled ? "text-green-400" : "text-slate-400"}`}>{referralEnabled ? "Enabled" : "Disabled"}</span>
                  <Switch checked={referralEnabled} onCheckedChange={setReferralEnabled} className="data-[state=checked]:bg-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Reward Rules (JSON)</label>
                <textarea value={referralRules} onChange={e => setReferralRules(e.target.value)} rows={8} className="w-full bg-slate-900 border border-slate-600 rounded-lg text-white text-sm font-mono px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
              </div>
              <Button onClick={() => saveReferralSettings.mutate()} disabled={saveReferralSettings.isPending} className="bg-blue-600 hover:bg-blue-500 text-white">
                {saveReferralSettings.isPending ? "Saving…" : "Save Settings"}
              </Button>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700">
                <h3 className="font-semibold text-white text-lg">User Referral Stats</h3>
                <div className="flex gap-2">
                  <input type="text" placeholder="Search..." value={referralSearch} onChange={e => setReferralSearch(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-lg text-white text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56" />
                  <Button size="sm" variant="outline" onClick={exportReferralCSV} className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-1.5"><Download className="w-4 h-4" /> Export</Button>
                  <Button size="sm" variant="ghost" onClick={() => refetchReferrals()} className="text-slate-400"><RefreshCw className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">User</TableHead>
                      <TableHead className="text-slate-400">Code</TableHead>
                      <TableHead className="text-slate-400 text-center">Total</TableHead>
                      <TableHead className="text-slate-400 text-center">Successful</TableHead>
                      <TableHead className="text-slate-400 text-center">Premium</TableHead>
                      <TableHead className="text-slate-400 text-center">Bonus</TableHead>
                      <TableHead className="text-slate-400">Referred By</TableHead>
                      <TableHead className="text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralData.filter(u => { const q = referralSearch.toLowerCase(); return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q); }).sort((a, b) => b.total_referrals - a.total_referrals).map(u => (
                      <TableRow key={u.id} className="border-slate-700">
                        <TableCell><div className="font-medium text-white text-sm">{u.name}</div><div className="text-slate-400 text-xs">{u.email}</div></TableCell>
                        <TableCell><code className="text-blue-300 bg-slate-700 px-2 py-0.5 rounded text-xs">{u.referral_code}</code></TableCell>
                        <TableCell className="text-center text-white font-semibold">{u.total_referrals}</TableCell>
                        <TableCell className="text-center text-green-400 font-semibold">{u.successful_referrals}</TableCell>
                        <TableCell className="text-center text-yellow-400 font-semibold">{u.premium_conversions}</TableCell>
                        <TableCell className="text-center"><span className={`font-semibold ${u.referral_bonus_count > 0 ? "text-purple-400" : "text-slate-500"}`}>{u.referral_bonus_count}</span></TableCell>
                        <TableCell className="text-slate-300 text-sm">{u.referred_by_name ?? <span className="text-slate-500 italic">—</span>}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => { setEditBonusUser({ id: u.id, name: u.name, bonus: u.referral_bonus_count }); setBonusInput(String(u.referral_bonus_count)); setEditBonusDialog(true); }} className="text-slate-400 hover:text-white h-8 px-2"><Edit3 className="w-3.5 h-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {referralData.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No referral data yet</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* ── COUPONS TAB ── */}
          <TabsContent value="coupons" className="space-y-6">
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Tag className="w-5 h-5 text-blue-400" /> Create Coupon</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <Label className="text-slate-300 text-sm mb-1 block">Coupon Code</Label>
                    <Input placeholder="e.g. SAVE200" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="bg-slate-700 border-slate-600 text-white font-mono uppercase" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm mb-1 block">Final Price (Rs.)</Label>
                    <Input type="number" placeholder="e.g. 500" value={couponPrice} onChange={(e) => setCouponPrice(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm mb-1 block">Description</Label>
                    <Input placeholder="e.g. Student discount" value={couponDesc} onChange={(e) => setCouponDesc(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                </div>
                <Button onClick={() => createCoupon.mutate()} disabled={createCoupon.isPending || !couponCode || !couponPrice} className="bg-blue-600 hover:bg-blue-500 text-white">
                  <Tag className="w-4 h-4 mr-2" />{createCoupon.isPending ? "Creating..." : "Create Coupon"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-white">Active Coupons</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => refetchCoupons()} className="text-slate-400"><RefreshCw className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Code</TableHead>
                      <TableHead className="text-slate-400">Final Price</TableHead>
                      <TableHead className="text-slate-400">Description</TableHead>
                      <TableHead className="text-slate-400">Created</TableHead>
                      <TableHead className="text-slate-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((c) => (
                      <TableRow key={c.id} className="border-slate-700">
                        <TableCell className="text-white font-mono font-bold">{c.coupon_code}</TableCell>
                        <TableCell className="text-green-400 font-semibold">Rs. {c.custom_price}</TableCell>
                        <TableCell className="text-slate-400 text-sm">{c.description || "—"}</TableCell>
                        <TableCell className="text-slate-500 text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-PK") : "—"}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-900/30 h-7 px-2" onClick={() => deleteCoupon.mutate(c.id)} disabled={deleteCoupon.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {coupons.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-8">No coupons yet.</TableCell></TableRow>}
                  </TableBody>
                </Table>
                <div className="mt-4 p-3 rounded-lg bg-slate-700/40 border border-slate-600">
                  <p className="text-slate-400 text-xs font-medium mb-1">Default Hardcoded Coupons</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ code: "BYONSOFT500", price: 500 }, { code: "GCTVIP", price: 500 }, { code: "EARN500", price: 500 }].map((h) => (
                      <Badge key={h.code} className="bg-slate-600 text-slate-300 font-mono text-xs">{h.code} → Rs. {h.price}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Screenshot Dialog */}
      <Dialog open={!!screenshotTx} onOpenChange={(o) => { if (!o) setScreenshotTx(null); }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Eye className="w-5 h-5 text-blue-400" />Payment Screenshot — {screenshotTx?.user_name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="p-2 rounded-lg bg-slate-700/60 border border-slate-600"><span className="text-slate-400 mr-2">Method:</span><span className="text-white font-medium">{screenshotTx?.method}</span></div>
              <div className="p-2 rounded-lg bg-slate-700/60 border border-slate-600"><span className="text-slate-400 mr-2">TRX:</span><span className="text-white font-mono">{screenshotTx?.trx_id}</span></div>
              <div className="p-2 rounded-lg bg-slate-700/60 border border-slate-600"><span className="text-slate-400 mr-2">Amount:</span><span className="text-green-400 font-bold">Rs. {screenshotTx?.amount}</span></div>
            </div>
            {screenshotTx?.screenshot_url ? (
              <div className="rounded-xl overflow-hidden border border-slate-600 bg-slate-900">
                <img src={screenshotTx.screenshot_url} alt="Payment Screenshot" className="w-full max-h-96 object-contain" />
              </div>
            ) : <div className="text-center py-10 text-slate-500">No screenshot uploaded</div>}
            {screenshotTx?.status === "pending" && (
              <div className="flex gap-3">
                <Button className="flex-1 bg-green-700 hover:bg-green-600 text-white" disabled={updateTxStatus.isPending} onClick={() => { updateTxStatus.mutate({ id: screenshotTx.id, status: "approved" }); setScreenshotTx(null); }}>
                  <Check className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button variant="destructive" className="flex-1" disabled={updateTxStatus.isPending} onClick={() => { updateTxStatus.mutate({ id: screenshotTx.id, status: "rejected" }); setScreenshotTx(null); }}>
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Dialog */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle>{editCourse ? "Edit Course" : "Add New Course"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-slate-300 mb-1">Title</Label><Input className="bg-slate-700 border-slate-600 text-white" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="Course title" /></div>
            <div><Label className="text-slate-300 mb-1">Category</Label><Input className="bg-slate-700 border-slate-600 text-white" value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} placeholder="e.g. Programming, Design" /></div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-slate-300">Description</Label>
                {editCourse && (
                  <button
                    onClick={async () => {
                      try {
                        setCourseForm(prev => ({ ...prev, description: "⏳ AI likh raha hai..." }));
                        const res = await apiRequest("POST", `/api/admin/courses/${editCourse.id}/generate-description`, {});
                        const data = await res.json();
                        if (data.error) throw new Error(data.error);
                        setCourseForm(prev => ({ ...prev, description: data.description }));
                        toast({ title: "✨ Description generated!" });
                      } catch (err: any) {
                        toast({ title: "Failed", description: err.message, variant: "destructive" });
                        setCourseForm(prev => ({ ...prev, description: "" }));
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-lg transition-all font-medium"
                  >
                    <Brain className="w-3 h-3" />
                    ✨ Auto Generate
                  </button>
                )}
              </div>
              <Textarea className="bg-slate-700 border-slate-600 text-white resize-none" rows={4} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Describe the course..." />
            </div>
            <div><Label className="text-slate-300 mb-1">Tags</Label><Input className="bg-slate-700 border-slate-600 text-white" value={courseForm.tags} onChange={(e) => setCourseForm({ ...courseForm, tags: e.target.value })} placeholder="e.g. SEO, Freelancing" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCourseDialog(false)} className="text-slate-400">Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={() => saveCourse.mutate()} disabled={saveCourse.isPending || !courseForm.title || !courseForm.category}>
              {saveCourse.isPending ? "Saving..." : editCourse ? "Update Course" : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Manager Dialog */}
      <Dialog open={lessonDialog} onOpenChange={(open) => { setLessonDialog(open); if (!open) { setEditLesson(null); setLessonForm({ title: "", video_url: "", module_name: "" }); setDriveUrl(""); setDriveModuleName(""); setDriveDrafts([]); } }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-400" />Lessons — {lessonCourse?.title}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {courseLessons.length === 0 ? <p className="text-slate-500 text-sm text-center py-4">No lessons yet.</p> : courseLessons.map((lesson, idx) => (
              <div key={lesson.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${editLesson?.id === lesson.id ? "border-purple-500/50 bg-purple-900/20" : "border-slate-600 bg-slate-700/40"}`}>
                <span className="text-slate-500 text-xs w-5 text-right shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{lesson.title}</p>
                  {lesson.module_name ? <p className="text-blue-400 text-xs truncate">{lesson.module_name}</p> : <p className="text-slate-500 text-xs italic">No module</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-400" onClick={() => { setEditLesson(lesson); setLessonForm({ title: lesson.title, video_url: lesson.video_url, module_name: lesson.module_name || "" }); }}><Edit3 className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" disabled={deleteLesson.isPending} onClick={() => deleteLesson.mutate(lesson.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-700 pt-4 space-y-3">
            <p className="text-slate-300 text-sm font-medium">{editLesson ? "Edit Lesson" : "Add New Lesson"}</p>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-slate-400 text-xs mb-1">Lesson Title</Label><Input className="bg-slate-700 border-slate-600 text-white" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" /></div>
              <div><Label className="text-slate-400 text-xs mb-1">Module Name</Label><Input className="bg-slate-700 border-slate-600 text-white" value={lessonForm.module_name} onChange={(e) => setLessonForm({ ...lessonForm, module_name: e.target.value })} placeholder="e.g. Section 1" /></div>
            </div>
            <div>
              <Label className="text-slate-400 text-xs mb-1">Video URL</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} placeholder="YouTube or Drive URL" />
            </div>
            <div className="flex gap-2">
              {editLesson && <Button size="sm" variant="ghost" className="text-slate-400" onClick={() => { setEditLesson(null); setLessonForm({ title: "", video_url: "", module_name: "" }); }}>Cancel</Button>}
              <Button size="sm" className="bg-purple-600 text-white" disabled={saveLesson.isPending || !lessonForm.title || !lessonForm.video_url} onClick={() => saveLesson.mutate()}>
                {saveLesson.isPending ? "Saving..." : editLesson ? "Update" : "Add Lesson"}
              </Button>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-4 space-y-3">
            <p className="text-slate-300 text-sm font-medium flex items-center gap-2"><FolderOpen className="w-4 h-4 text-blue-400" />Import from Drive</p>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-slate-400 text-xs mb-1">Module Name *</Label><Input className="bg-slate-700 border-slate-600 text-white text-sm" placeholder="Section 1: Basics" value={driveModuleName} onChange={(e) => setDriveModuleName(e.target.value)} /></div>
              <div><Label className="text-slate-400 text-xs mb-1">Drive Folder URL *</Label><div className="flex gap-2"><Input className="bg-slate-700 border-slate-600 text-white text-sm" placeholder="Paste folder URL..." value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchDriveLessons()} /><Button size="sm" className="bg-blue-600 text-white shrink-0" disabled={!driveUrl.trim() || !driveModuleName.trim() || driveFetching} onClick={fetchDriveLessons}>{driveFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Fetch"}</Button></div></div>
            </div>
            {driveDrafts.length > 0 && (
              <div className="space-y-2">
                <span className="text-slate-400 text-xs">{driveDrafts.length} files fetched</span>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {driveDrafts.map((d, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input className="bg-slate-700/60 border-slate-600 text-white text-xs h-8 flex-1" value={d.title} onChange={(e) => setDriveDrafts((prev) => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 shrink-0" onClick={() => setDriveDrafts((prev) => prev.filter((_, j) => j !== i))}><X className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={bulkImportDrive.isPending || driveDrafts.length === 0} onClick={() => bulkImportDrive.mutate()}>
                  {bulkImportDrive.isPending ? "Uploading..." : `Upload ${driveDrafts.length} Lessons`}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Bonus Dialog */}
      <Dialog open={editBonusDialog} onOpenChange={setEditBonusDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Gift className="w-5 h-5 text-purple-400" />Adjust Bonus — {editBonusUser?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-300 shrink-0">Bonus Count:</label>
              <input type="number" min={0} value={bonusInput} onChange={e => setBonusInput(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-lg text-white text-sm px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditBonusDialog(false)} className="text-slate-400">Cancel</Button>
            <Button onClick={() => adjustBonus.mutate({ userId: editBonusUser!.id, bonus: parseInt(bonusInput, 10) || 0 })} disabled={adjustBonus.isPending} className="bg-purple-600 hover:bg-purple-500 text-white">
              {adjustBonus.isPending ? "Saving…" : "Save Bonus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
