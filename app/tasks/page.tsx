"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ExternalLink, Star, Send, MessageCircle, Users, User, Play, Calendar, Coins } from "lucide-react";
import { useTelegram } from "@/components/telegram-provider";

interface Task {
  id: number;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  reward: number;
  task_type: string;
  action_url: string | null;
  icon: string;
  completed: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  send: Send,
  twitter: MessageCircle,
  users: Users,
  user: User,
  play: Play,
  calendar: Calendar,
};

export default function TasksPage() {
  const { user, isReady, hapticFeedback } = useTelegram();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  useEffect(() => {
    if (isReady && user) {
      fetchTasks();
    }
  }, [isReady, user]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?telegram_id=${user?.id}`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (task: Task) => {
    if (task.completed || completingId === task.id) return;

    // If has action URL, open it first
    if (task.action_url) {
      window.open(task.action_url, "_blank");
    }

    setCompletingId(task.id);
    hapticFeedback("medium");

    // Small delay to simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: user?.id,
          task_id: task.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setRewardAmount(data.reward);
        setShowReward(true);
        hapticFeedback("heavy");

        setTimeout(() => {
          setShowReward(false);
          fetchTasks();
        }, 2000);
      }
    } catch (error) {
      console.error("Error completing task:", error);
    } finally {
      setCompletingId(null);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalRewards = tasks.reduce((sum, t) => sum + t.reward, 0);
  const earnedRewards = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.reward, 0);

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
        <h1 className="text-2xl font-bold gradient-text">Tasks</h1>
        <p className="text-muted-foreground mt-1">المهام</p>
      </motion.div>

      {/* Reward Popup */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div className="bg-card rounded-3xl p-8 text-center" initial={{ y: 50 }} animate={{ y: 0 }}>
              <motion.div
                className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Coins className="w-10 h-10 text-accent" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">+{rewardAmount}</h2>
              <p className="text-muted-foreground">Task Completed! | تمت المهمة!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-4"
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground">Progress | التقدم</span>
          <span className="text-sm font-semibold">
            {completedCount}/{tasks.length}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between items-center mt-3 text-sm">
          <span className="text-muted-foreground">Earned | مكتسب</span>
          <span className="font-semibold text-accent">
            {earnedRewards} / {totalRewards}
          </span>
        </div>
      </motion.div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const Icon = iconMap[task.icon] || Star;
          const isCompleting = completingId === task.id;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-card rounded-xl p-4 ${task.completed ? "opacity-60" : "card-hover"}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    task.completed ? "bg-accent/20" : "bg-primary/20"
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6 text-accent" />
                  ) : (
                    <Icon className="w-6 h-6 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{task.title}</h3>
                  {task.title_ar && <p className="text-sm text-muted-foreground">{task.title_ar}</p>}
                  {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`font-bold ${task.completed ? "text-accent" : "text-primary"}`}>+{task.reward}</span>

                  {!task.completed && (
                    <button
                      onClick={() => completeTask(task)}
                      disabled={isCompleting}
                      className="flex items-center gap-1 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-lg text-sm font-medium transition-colors btn-press disabled:opacity-50"
                    >
                      {isCompleting ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <>
                          {task.action_url && <ExternalLink className="w-3 h-3" />}
                          <span>Go</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No tasks available</p>
          <p className="text-sm text-muted-foreground">لا توجد مهام متاحة</p>
        </div>
      )}
    </div>
  );
}
