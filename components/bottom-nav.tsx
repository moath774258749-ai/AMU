"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gift, CheckSquare, Users, Trophy, User } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", icon: Home, label: "Home", labelAr: "الرئيسية" },
  { href: "/daily", icon: Gift, label: "Daily", labelAr: "يومي" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks", labelAr: "المهام" },
  { href: "/referral", icon: Users, label: "Invite", labelAr: "دعوة" },
  { href: "/leaderboard", icon: Trophy, label: "Top", labelAr: "الترتيب" },
  { href: "/profile", icon: User, label: "Profile", labelAr: "الملف" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-muted safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center px-2 py-1 min-w-[50px]"
            >
              <motion.div
                className={`flex flex-col items-center ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1 w-8 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
