'use client';

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Mail, Lock, Sparkles, Check } from 'lucide-react';
import { demoCredentials } from '@/lib/constants/demo';

interface DemoInfoProps {
  className?: string;
}

export const DemoInfo: React.FC<DemoInfoProps> = memo(function DemoInfo({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Info Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
        aria-label="App information"
      >
        <Info size={20} />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md h-fit max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl z-[60] overflow-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AppointmentHub</h2>
                      <p className="text-blue-100 text-sm">Smart Queue Manager</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* About Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    About This App
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    A complete appointment and queue management system. Create staff, define services, 
                    schedule appointments, and manage waiting queues with real-time updates.
                  </p>
                </div>

                {/* Demo Credentials */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    Demo Account Credentials
                  </h3>
                  
                  {/* Email */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Mail size={16} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <code className="text-sm font-mono text-gray-800">{demoCredentials.email}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(demoCredentials.email, 'email')}
                      className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                    >
                      {copied === 'email' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Password */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Lock size={16} className="text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Password</p>
                      <code className="text-sm font-mono text-gray-800">{demoCredentials.password}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(demoCredentials.password, 'password')}
                      className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors shadow-sm"
                    >
                      {copied === 'password' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Footer Note */}
                <p className="text-xs text-gray-400 text-center">
                  Click &quot;Try Demo&quot; on the login page or use credentials above
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

export default DemoInfo;
