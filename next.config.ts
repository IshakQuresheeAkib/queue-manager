import type { NextConfig } from "next";

// Extract hostname from NEXT_PUBLIC_SUPABASE_URL environment variable
const getSupabaseHostname = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return 'localhost';
  }
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    console.warn(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}. Using 'localhost' as fallback.`);
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
