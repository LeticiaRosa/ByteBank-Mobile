import { createClient } from "@supabase/supabase-js";

import { Database } from "./database.types";
import { clientEnv } from "../env/client";

export const supabase = createClient<Database>(
  clientEnv.EXPO_PUBLIC_SUPABASE_URL,
  clientEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY
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
