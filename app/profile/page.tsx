"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Coins, Flame, Calendar, ArrowUpRight, ArrowDownRight, Gift, CheckSquare, Users } from "lucide-react";
import { useTelegram } from "@/components/telegram-provider";
import { formatDistanceToNow } from "date-fns";

interface UserData {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  points: number;
  daily_streak: number;
  referral_code: string;
  created_at: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string | null;
  description_ar: string | null;
  created_at: string;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  daily_reward: Gift,
  task_reward: CheckSquare,
  referral_reward: Users,
  referral_bonus: Users,
};

const typeColors: Record<string, string> = {
  daily_reward: "text-accent",
  task_reward: "text-primary",
  referral_reward: "text-secondary",
  referral_bonus: "text-secondary",
};

export default function ProfilePage() {
  const { user, isReady, isInTelegram } = useTelegram();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && user) {
      fetchData();
    }
  }, [isReady, user]);

  const fetchData = async () => {
    try {
      const [userRes, transRes] = await Promise.all([
        fetch(`/api/user?telegram_id=${user?.id}`),
        fetch(`/api/transactions?telegram_id=${user?.id}&limit=20`),
      ]);

      const [userDataResult, transDataResult] = await Promise.all([userRes.json(), transRes.json()]);

      setUserData(userDataResult);
      setTransactions(transDataResult.transactions || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold gradient-text">Profile</h1>
        <p className="text-muted-foreground mt-1">الملف الشخصي</p>
      </motion.div>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-card to-muted rounded-2xl p-6 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-xl font-bold">
            {userData?.first_name} {userData?.last_name}
          </h2>
          {userData?.username && <p className="text-muted-foreground">@{userData.username}</p>}

          <div className="flex items-center justify-center gap-2 mt-4">
            <Coins className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold gradient-text">{userData?.points.toLocaleString()}</span>
            <span className="text-muted-foreground">UB</span>
          </div>

          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-muted">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm">{userData?.daily_streak || 0} day streak</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {userData?.created_at
                  ? formatDistanceToNow(new Date(userData.created_at), { addSuffix: true })
                  : "Recently"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Coins className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Points</span>
          </div>
          <p className="text-xl font-bold">{userData?.points.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-400/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-sm text-muted-foreground">Streak</span>
          </div>
          <p className="text-xl font-bold">{userData?.daily_streak || 0} days</p>
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="font-semibold px-1">Points History | سجل النقاط</h3>

        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx, index) => {
              const Icon = typeIcons[tx.type] || Coins;
              const colorClass = typeColors[tx.type] || "text-primary";
              const isPositive = tx.amount > 0;

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-card rounded-xl p-3 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-muted`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{tx.description || tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-accent" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`font-bold ${isPositive ? "text-accent" : "text-red-400"}`}>
                      {isPositive ? "+" : ""}
                      {tx.amount}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl p-8 text-center">
            <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground">لا توجد معاملات بعد</p>
          </div>
        )}
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs text-muted-foreground pt-4 border-t border-muted"
      >
        <p>Ubash v1.0.0</p>
        <p className="mt-1">
          {isInTelegram ? "Running inside Telegram" : "Running in browser"} |{" "}
          {isInTelegram ? "يعمل داخل تلجرام" : "يعمل في المتصفح"}
        </p>
      </motion.div>
    </div>
  );
}
