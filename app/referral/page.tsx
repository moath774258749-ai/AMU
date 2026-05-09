"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Copy, Share2, Gift, Check, UserPlus } from "lucide-react";
import { useTelegram } from "@/components/telegram-provider";

interface ReferralData {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  total_earnings: number;
  referrals: Array<{
    id: number;
    username: string | null;
    first_name: string | null;
    points: number;
    created_at: string;
  }>;
}

export default function ReferralPage() {
  const { user, isReady, hapticFeedback, isInTelegram } = useTelegram();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      fetchReferralData();
    }
  }, [isReady, user]);

  const fetchReferralData = async () => {
    try {
      const res = await fetch(`/api/referral?telegram_id=${user?.id}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!data) return;

    try {
      await navigator.clipboard.writeText(data.referral_link);
      setCopied(true);
      hapticFeedback("medium");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying:", error);
    }
  };

  const shareLink = () => {
    if (!data) return;

    const text = `🚀 Join Ubash and earn rewards!\n\nانضم إلى Ubash واربح المكافآت!\n\n${data.referral_link}`;

    if (isInTelegram) {
      const tg = (window as unknown as { Telegram?: { WebApp?: { openTelegramLink: (url: string) => void } } }).Telegram?.WebApp;
      tg?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(data.referral_link)}&text=${encodeURIComponent("🚀 Join Ubash and earn rewards! | انضم إلى Ubash واربح المكافآت!")}`);
    } else if (navigator.share) {
      navigator.share({ title: "Ubash", text, url: data.referral_link });
    } else {
      copyLink();
    }

    hapticFeedback("medium");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-2xl font-bold gradient-text">Invite Friends</h1>
        <p className="text-muted-foreground mt-1">ادعُ الأصدقاء</p>
      </motion.div>

      {/* Rewards Info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center">
            <Gift className="w-7 h-7 text-secondary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Earn Together!</h2>
            <p className="text-sm text-muted-foreground">اربح معاً!</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
              +200
            </div>
            <span>You get 200 points per friend | تحصل على 200 نقطة لكل صديق</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              +100
            </div>
            <span>Friend gets 100 points | الصديق يحصل على 100 نقطة</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-card rounded-xl p-4 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{data?.total_referrals || 0}</p>
          <p className="text-xs text-muted-foreground">Friends Invited | أصدقاء مدعوون</p>
        </div>
        <div className="bg-card rounded-xl p-4 text-center">
          <Gift className="w-8 h-8 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-accent">{data?.total_earnings || 0}</p>
          <p className="text-xs text-muted-foreground">Points Earned | نقاط مكتسبة</p>
        </div>
      </motion.div>

      {/* Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-4 space-y-4"
      >
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Your Referral Link | رابط الإحالة الخاص بك</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={data?.referral_link || ""}
              className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm truncate outline-none"
            />
            <button
              onClick={copyLink}
              className="bg-primary/20 hover:bg-primary/30 text-primary px-4 rounded-xl transition-colors btn-press"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={shareLink}
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 btn-press glow-primary"
          >
            <Share2 className="w-5 h-5" />
            <span>Share | مشاركة</span>
          </button>
        </div>
      </motion.div>

      {/* Referrals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h3 className="font-semibold px-1">Your Referrals | إحالاتك</h3>

        {data?.referrals && data.referrals.length > 0 ? (
          <div className="space-y-2">
            {data.referrals.map((ref, index) => (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-card rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{ref.first_name || ref.username || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ref.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-accent">+200</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No referrals yet</p>
            <p className="text-sm text-muted-foreground">لا توجد إحالات بعد</p>
            <p className="text-xs text-muted-foreground mt-2">Share your link to start earning!</p>
            <p className="text-xs text-muted-foreground">شارك رابطك لبدء الربح!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
