"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Flame, User } from "lucide-react";
import { useTelegram } from "@/components/telegram-provider";

interface LeaderboardEntry {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  points: number;
  daily_streak: number;
  rank: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  user_rank: number | null;
  total_users: number;
}

export default function LeaderboardPage() {
  const { user, isReady } = useTelegram();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && user) {
      fetchLeaderboard();
    }
  }, [isReady, user]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?telegram_id=${user?.id}&limit=50`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/5 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-300/20 to-gray-400/5 border-gray-300/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/5 border-amber-600/30";
      default:
        return "bg-card border-transparent";
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
        <h1 className="text-2xl font-bold gradient-text">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">المتصدرين</p>
      </motion.div>

      {/* User's Rank */}
      {data?.user_rank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Your Rank | ترتيبك</p>
              <p className="text-sm text-muted-foreground">
                out of {data.total_users} users | من {data.total_users} مستخدم
              </p>
            </div>
          </div>
          <div className="text-3xl font-bold gradient-text">#{data.user_rank}</div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {data?.leaderboard && data.leaderboard.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-end justify-center gap-4 py-4"
        >
          {/* 2nd Place */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-gray-300/20 border-2 border-gray-300/50 flex items-center justify-center mx-auto mb-2"
            >
              <User className="w-8 h-8 text-gray-300" />
            </motion.div>
            <Medal className="w-6 h-6 text-gray-300 mx-auto" />
            <p className="font-medium text-sm mt-1 truncate max-w-[80px]">
              {data.leaderboard[1].first_name || data.leaderboard[1].username || "User"}
            </p>
            <p className="text-xs text-muted-foreground">{data.leaderboard[1].points.toLocaleString()}</p>
          </div>

          {/* 1st Place */}
          <div className="text-center -mt-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-yellow-400/20 border-2 border-yellow-400/50 flex items-center justify-center mx-auto mb-2 animate-pulse-glow"
            >
              <User className="w-10 h-10 text-yellow-400" />
            </motion.div>
            <Crown className="w-8 h-8 text-yellow-400 mx-auto animate-float" />
            <p className="font-bold text-sm mt-1 truncate max-w-[90px]">
              {data.leaderboard[0].first_name || data.leaderboard[0].username || "User"}
            </p>
            <p className="text-sm text-yellow-400 font-semibold">{data.leaderboard[0].points.toLocaleString()}</p>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-14 h-14 rounded-full bg-amber-600/20 border-2 border-amber-600/50 flex items-center justify-center mx-auto mb-2"
            >
              <User className="w-7 h-7 text-amber-600" />
            </motion.div>
            <Medal className="w-5 h-5 text-amber-600 mx-auto" />
            <p className="font-medium text-sm mt-1 truncate max-w-[70px]">
              {data.leaderboard[2].first_name || data.leaderboard[2].username || "User"}
            </p>
            <p className="text-xs text-muted-foreground">{data.leaderboard[2].points.toLocaleString()}</p>
          </div>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        {data?.leaderboard.map((entry, index) => {
          const isCurrentUser = entry.telegram_id === user?.id;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className={`rounded-xl p-3 flex items-center gap-3 border ${getRankStyle(entry.rank)} ${
                isCurrentUser ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="w-10 flex items-center justify-center">{getRankIcon(entry.rank)}</div>

              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isCurrentUser ? "text-primary" : ""}`}>
                  {entry.first_name || entry.username || "User"}
                  {isCurrentUser && " (You | أنت)"}
                </p>
                {entry.daily_streak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <Flame className="w-3 h-3" />
                    <span>{entry.daily_streak} day streak</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="font-bold gradient-text">{entry.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {(!data?.leaderboard || data.leaderboard.length === 0) && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No users yet</p>
          <p className="text-sm text-muted-foreground">لا يوجد مستخدمون بعد</p>
        </div>
      )}
    </div>
  );
}
