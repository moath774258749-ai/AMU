"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Flame, Gift, CheckSquare, Users, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTelegram } from "@/components/telegram-provider";

interface UserData {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  points: number;
  daily_streak: number;
  referral_code: string;
}

interface DailyStatus {
  can_claim: boolean;
  current_streak: number;
  next_reward: number;
}

export default function Dashboard() {
  const { user, isReady } = useTelegram();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && user) {
      initUser();
    }
  }, [isReady, user]);

  const initUser = async () => {
    try {
      // Create or update user
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: user?.id,
          username: user?.username,
          first_name: user?.first_name,
          last_name: user?.last_name,
          photo_url: user?.photo_url,
        }),
      });
      const data = await res.json();
      setUserData(data);

      // Get daily status
      const dailyRes = await fetch(`/api/daily?telegram_id=${user?.id}`);
      const dailyData = await dailyRes.json();
      setDailyStatus(dailyData);
    } catch (error) {
      console.error("Error initializing user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userData) {
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

  const quickActions = [
    { href: "/daily", icon: Gift, label: "Daily Reward", labelAr: "المكافأة اليومية", color: "text-accent", badge: dailyStatus?.can_claim ? "!" : null },
    { href: "/tasks", icon: CheckSquare, label: "Tasks", labelAr: "المهام", color: "text-primary" },
    { href: "/referral", icon: Users, label: "Invite Friends", labelAr: "دعوة الأصدقاء", color: "text-secondary" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard", labelAr: "المتصدرين", color: "text-yellow-400" },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold">
          Welcome, <span className="gradient-text">{userData.first_name || "User"}</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          مرحباً بك في Ubash
        </p>
      </motion.div>

      {/* Points Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted p-6 glow-primary"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Coins className="w-5 h-5 text-primary" />
            <span className="text-sm">Your Balance | رصيدك</span>
          </div>
          
          <motion.div
            className="text-4xl font-bold gradient-text"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            {userData.points.toLocaleString()}
          </motion.div>
          <p className="text-sm text-muted-foreground mt-1">UB Points | نقاط UB</p>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-muted">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm">
                {userData.daily_streak} Day Streak | سلسلة أيام
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold px-1">Quick Actions | إجراءات سريعة</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link href={action.href}>
                  <div className="relative bg-card rounded-xl p-4 card-hover btn-press">
                    {action.badge && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                        {action.badge}
                      </span>
                    )}
                    <Icon className={`w-8 h-8 ${action.color} mb-2`} />
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.labelAr}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Daily Reward Banner */}
      {dailyStatus?.can_claim && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/daily">
            <div className="bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/30 rounded-xl p-4 flex items-center justify-between card-hover btn-press">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-accent animate-float" />
                </div>
                <div>
                  <p className="font-semibold">Daily Reward Ready!</p>
                  <p className="text-sm text-muted-foreground">المكافأة اليومية جاهزة!</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-accent">
                <span className="font-bold">+{dailyStatus.next_reward}</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Stats Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{userData.daily_streak}</p>
          <p className="text-xs text-muted-foreground">Streak | سلسلة</p>
        </div>
        <Link href="/referral">
          <div className="bg-card rounded-xl p-4 text-center card-hover">
            <p className="text-2xl font-bold text-secondary">0</p>
            <p className="text-xs text-muted-foreground">Referrals | إحالات</p>
          </div>
        </Link>
        <Link href="/leaderboard">
          <div className="bg-card rounded-xl p-4 text-center card-hover">
            <p className="text-2xl font-bold text-yellow-400">#--</p>
            <p className="text-xs text-muted-foreground">Rank | الترتيب</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
