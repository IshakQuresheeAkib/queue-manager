import type { NextConfig } from "next";

// Extract hostname from NEXT_PUBLIC_SUPABASE_URL environment variable
const getSupabaseHostname = (): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL not set - images may not load');
    return 'localhost';
  }
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    console.warn(`⚠️ Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
    return 'localhost';
  }
};

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
