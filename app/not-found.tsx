'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-40 right-20 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-teal-500/20 rounded-full blur-xl"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          className="mb-8"
        >
          <div className="relative inline-block">
            {/* Glowing effect behind 404 */}
            <div className="absolute inset-0 blur-3xl bg-green-500/30 scale-150" />
            
            <motion.h1
              className="relative text-[120px] sm:text-[150px] md:text-[180px] font-black leading-none"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #4ade80 50%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              404
            </motion.h1>
          </div>
        </motion.div>

        {/* Animated search icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded-full shadow-lg text-white"
          >
            <Search className="w-8 h-8 opacity-80" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-white/60 text-base sm:text-lg max-w-md mx-auto px-4">
            Oops! The page you&apos;re looking for seems to have wandered off. 
            Let&apos;s get you back on track.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-200"
          >
            <Home size={20} />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white font-semibold rounded-full shadow-md hover:bg-white/20 hover:scale-105 transition-all duration-200 border border-white/10"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </motion.div>

        {/* Decorative dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex items-center justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
