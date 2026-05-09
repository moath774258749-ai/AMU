"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  isReady: boolean;
  isInTelegram: boolean;
  initData: string;
  hapticFeedback: (type: "light" | "medium" | "heavy") => void;
  showAlert: (message: string) => void;
  close: () => void;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  isReady: false,
  isInTelegram: false,
  initData: "",
  hapticFeedback: () => {},
  showAlert: () => {},
  close: () => {},
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInTelegram, setIsInTelegram] = useState(false);
  const [initData, setInitData] = useState("");

  useEffect(() => {
    const initTelegram = () => {
      const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
      
      if (tg) {
        setIsInTelegram(true);
        tg.ready();
        tg.expand();
        
        // Set theme
        document.documentElement.style.setProperty("--tg-theme-bg-color", "#0B1120");
        
        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
        }
        
        setInitData(tg.initData || "");
        setIsReady(true);
      } else {
        // Development mode - mock user
        setUser({
          id: 123456789,
          first_name: "Test",
          last_name: "User",
          username: "testuser",
          language_code: "en",
        });
        setIsReady(true);
      }
    };

    // Wait for Telegram script to load
    if (document.readyState === "complete") {
      initTelegram();
    } else {
      window.addEventListener("load", initTelegram);
      return () => window.removeEventListener("load", initTelegram);
    }
  }, []);

  const hapticFeedback = (type: "light" | "medium" | "heavy") => {
    const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  };

  const showAlert = (message: string) => {
    const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
    if (tg?.showAlert) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  };

  const close = () => {
    const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
    if (tg?.close) {
      tg.close();
    }
  };

  return (
    <TelegramContext.Provider
      value={{
        user,
        isReady,
        isInTelegram,
        initData,
        hapticFeedback,
        showAlert,
        close,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);

// Types for Telegram WebApp
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
  };
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
  };
  showAlert?: (message: string) => void;
}
