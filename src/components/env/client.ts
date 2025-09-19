import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// React Native/Expo environment variables access
const env = process.env as Record<string, string | undefined>;

export const clientEnv = createEnv({
  clientPrefix: "EXPO_PUBLIC_",

  client: {
    EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    EXPO_PUBLIC_APP_NAME: z.string().default("ByteBank"),
    EXPO_PUBLIC_APP_VERSION: z.string().default("1.0.0"),
  },

  runtimeEnv: {
    // Map old VITE_ variables to new EXPO_PUBLIC_ variables for backward compatibility
    EXPO_PUBLIC_SUPABASE_URL:
      env.VITE_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY:
      env.VITE_SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_APP_NAME: env.VITE_APP_NAME || env.EXPO_PUBLIC_APP_NAME,
    EXPO_PUBLIC_APP_VERSION:
      env.VITE_APP_VERSION || env.EXPO_PUBLIC_APP_VERSION,
  },
  emptyStringAsUndefined: true,
});
