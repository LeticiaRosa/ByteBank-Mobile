import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Database } from "./database.types";
import { clientEnv } from "../env/client";

export const supabase = createClient<Database>(
  clientEnv.EXPO_PUBLIC_SUPABASE_URL,
  clientEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export type User = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
};

export type AuthError = {
  message: string;
  status?: number;
};
