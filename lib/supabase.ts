import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY ?? "";

// サーバー側（API Route等）でのみ使用するクライアント。
// 秘密鍵を使うため、ブラウザ側のコードからは絶対にimportしないこと。
export const supabase = createClient(supabaseUrl, supabaseKey);
