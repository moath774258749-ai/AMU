import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  points: number;
  referral_code: string;
  referred_by: number | null;
  last_daily_claim: Date | null;
  daily_streak: number;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: number;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  reward: number;
  task_type: string;
  action_url: string | null;
  icon: string;
  is_active: boolean;
  created_at: Date;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: string;
  description: string | null;
  description_ar: string | null;
  created_at: Date;
}

// Generate a unique referral code
export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "UB";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
