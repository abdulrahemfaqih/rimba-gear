import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "outdoor";

// Singleton client instances
let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Mendapatkan Supabase client untuk sisi browser atau server publik
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("⚠️ Warning: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local");
    }
    supabaseInstance = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");
  }
  return supabaseInstance;
}

/**
 * Mendapatkan Supabase client dengan Service Role Key (untuk bypass RLS di Route Handler server-side)
 * Jika Service Role Key tidak tersedia, akan fallback ke Anon Key.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const key = supabaseServiceKey || supabaseAnonKey || "placeholder";
    supabaseAdminInstance = createClient(supabaseUrl || "https://placeholder.supabase.co", key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdminInstance;
}

/**
 * Upload buffer gambar ke Supabase Storage Bucket 'outdoor'
 */
export async function uploadToSupabaseStorage(
  buffer: Buffer,
  originalName: string,
  contentType: string = "image/webp"
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const ext = originalName.split(".").pop() || "webp";
  const cleanName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 30);
  const filePath = `uploads/${Date.now()}-${cleanName || "image"}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage upload error: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
