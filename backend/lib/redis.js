// backend/lib/redis.js
import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";

// نحمّل المتغيرات من ملف النظام الثابت (خارج المشروع)
dotenv.config({ path: "/etc/shop2/.env" });

// في حال المتغير مفقود، نرمي خطأ واضح بدل الرجوع لـ localhost
if (!process.env.UPSTASH_REDIS_URL) {
  throw new Error("UPSTASH_REDIS_URL is missing. Set it in /etc/shop2/.env");
}

// نهيئ اتصال Redis باستخدام Upstash
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
