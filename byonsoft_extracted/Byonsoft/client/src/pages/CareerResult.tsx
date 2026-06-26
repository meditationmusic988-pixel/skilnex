import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2, Download, ArrowLeft, Star, TrendingUp, DollarSign,
  Clock, BookOpen, Zap, Target, Award, CheckCircle, Brain
} from "lucide-react";
import { Link } from "wouter";

export default function CareerResult() {
  const search = useSearch();
  const userId = new URLSearchParams(search).get("u");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: result, isLoading } = useQuery({
    queryKey: ["/api/share-image", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch(`/api/share-image/${userId}`);
      if (!res.ok) throw new Error("Failed to load result");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      return url;
    },
    enabled: !!userId,
  });

  const handleShare = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "skilnex-skill-result.png", { type: "image/png" });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Skilnex AI Skill Result",
          text: "Check out my AI-generated career roadmap!",
          files: [file],
        });
      } else {
        // Fallback: download the image
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = "skilnex-skill-result.png";
        link.click();
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    setDownloading(true);
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "skilnex-skill-result.png";
    link.click();
    setTimeout(() => setDownloading(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070D18] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your career result...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#070D18] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No result found. Take the skill test first!</p>
          <Link href="/skill-test?new=1">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Take Skill Test
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D18] text-white">
      <header className="sticky top-0 z-40 bg-[#070D18]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Home
            </Button>
          </Link>
          <span className="font-bold text-sm">Skilnex <span className="text-blue-400">OS</span></span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your AI Career Result</h1>
          <p className="text-slate-400 text-sm">Personalized skill assessment & roadmap</p>
        </div>

        {/* Result Image */}
        {imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700/50">
            <img
              src={imageUrl}
              alt="Skill Result"
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mb-8">
          <Button
            onClick={handleShare}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share on Facebook
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={downloading}
            className="border-slate-600 text-slate-300 hover:text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Downloading..." : "Download Image"}
          </Button>
        </div>

        {/* CTA */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
          <p className="text-slate-400 text-sm mb-4">
            Want your own personalized career roadmap?
          </p>
          <Link href="/skill-test?new=1">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Zap className="w-4 h-4 mr-2" />
              Take Free Skill Test
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
