import type { NextConfig } from "next";

// Extract hostname from NEXT_PUBLIC_SUPABASE_URL environment variable
const getSupabaseHostname = (): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is required but was not set. Please configure this environment variable to enable image loading.'
    );
  }
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is set to an invalid URL: "${supabaseUrl}". Please provide a valid URL.`
    );
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
