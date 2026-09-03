import { env } from "cloudflare:workers";

export interface AppEnv {
  DB: D1Database;
  MEDIA: R2Bucket;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
}

export const appEnv = env as unknown as AppEnv;
