"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Flame, Clock, Check, Coins } from "lucide-react";
import { useTelegram } from "@/components/telegram-provider";

interface DailyStatus {
  can_claim: boolean;
  current_streak: number;
  next_reward: number;
  hours_until_next_claim: number;
  rewards_schedule: number[];
}

export default function DailyRewardPage() {
  const { user, isReady, hapticFeedback } = useTelegram();
  const [status, setStatus] = useState<DailyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimedReward, setClaimedReward] = useState(0);

  useEffect(() => {
    if (isReady && user) {
      fetchDailyStatus();
    }
  }, [isReady, user]);

  const fetchDailyStatus = async () => {
    try {
      const res = await fetch(`/api/daily?telegram_id=${user?.id}`);
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching daily status:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async () => {
    if (!status?.can_claim || claiming) return;
    
    setClaiming(true);
    hapticFeedback("medium");

    try {
      const res = await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_id: user?.id }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setClaimedReward(data.reward);
        setShowSuccess(true);
        hapticFeedback("heavy");
        
        setTimeout(() => {
          setShowSuccess(false);
          fetchDailyStatus();
        }, 3000);
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
    } finally {
      setClaiming(false);
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold gradient-text">Daily Reward</h1>
        <p className="text-muted-foreground mt-1">المكافأة اليومية</p>
      </motion.div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              className="bg-card rounded-3xl p-8 text-center"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Coins className="w-12 h-12 text-accent" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">+{claimedReward}</h2>
              <p className="text-muted-foreground">Points Claimed!</p>
              <p className="text-sm text-muted-foreground">تم الحصول على النقاط!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Streak */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/30 rounded-2xl p-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="w-8 h-8 text-orange-400" />
          <span className="text-4xl font-bold text-orange-400">{status?.current_streak || 0}</span>
        </div>
        <p className="text-sm text-muted-foreground">Day Streak | سلسلة أيام</p>
      </motion.div>

      {/* Rewards Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-4"
      >
        <h2 className="text-lg font-semibold mb-4 text-center">
          Weekly Rewards | المكافآت الأسبوعية
        </h2>
        
        <div className="flex justify-between gap-2">
          {status?.rewards_schedule.map((reward, index) => {
            const dayNum = index + 1;
            const isCompleted = (status.current_streak || 0) >= dayNum;
            const isCurrent = (status.current_streak || 0) === index && status.can_claim;
            const isNext = (status.current_streak || 0) === dayNum - 1 && status.can_claim;
            
            return (
              <motion.div
                key={index}
                className={`flex-1 rounded-xl p-2 text-center transition-all ${
                  isCompleted
                    ? "bg-accent/20 border border-accent/50"
                    : isNext || isCurrent
                    ? "bg-primary/20 border border-primary/50 animate-pulse-glow"
                    : "bg-muted/50 border border-muted"
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className="text-xs text-muted-foreground mb-1">Day {dayNum}</div>
                {isCompleted ? (
                  <Check className="w-5 h-5 text-accent mx-auto" />
                ) : (
                  <div className={`text-sm font-bold ${isNext || isCurrent ? "text-primary" : ""}`}>
                    +{reward}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Claim Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-4"
      >
        {status?.can_claim ? (
          <button
            onClick={claimReward}
            disabled={claiming}
            className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 btn-press disabled:opacity-50 glow-primary"
          >
            {claiming ? (
              <motion.div
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <Gift className="w-6 h-6" />
                <span>Claim +{status.next_reward} Points | احصل على النقاط</span>
              </>
            )}
          </button>
        ) : (
          <div className="bg-muted rounded-xl p-6 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">Come back in {status?.hours_until_next_claim}h</p>
            <p className="text-sm text-muted-foreground">عد بعد {status?.hours_until_next_claim} ساعة</p>
          </div>
        )}
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-muted-foreground space-y-1"
      >
        <p>Claim daily to increase your streak!</p>
        <p>طالب يومياً لزيادة سلسلتك!</p>
        <p className="text-xs mt-2">Miss a day and your streak resets to 0</p>
        <p className="text-xs">فوّت يوماً وستعود سلسلتك إلى 0</p>
      </motion.div>
    </div>
  );
}
