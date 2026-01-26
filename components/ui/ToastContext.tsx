'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, XCircle, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ConfirmDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  confirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup all timeouts on unmount
  useEffect(() => {
    const timeouts = timeoutRefs.current;
    return () => {
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      timeouts.clear();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    // Clear the timeout if it exists
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const toast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      const timeoutId = setTimeout(() => removeToast(id), duration);
      timeoutRefs.current.set(id, timeoutId);
    }
  }, [removeToast]);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error', 5000), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  const confirm = useCallback((options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      setConfirmDialog({
        id,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'danger',
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  const contextValue = useMemo(() => ({
    showToast,
    success,
    error,
    info,
    warning,
    confirm,
  }), [showToast, success, error, info, warning, confirm]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="text-green-500 flex-shrink-0" size={20} />,
    error: <XCircle className="text-red-500 flex-shrink-0" size={20} />,
    info: <Info className="text-blue-500 flex-shrink-0" size={20} />,
    warning: <AlertCircle className="text-yellow-500 flex-shrink-0" size={20} />,
  };

  const bgColors: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  const confirmVariantStyles = {
    danger: {
      icon: <AlertTriangle className="text-red-500" size={24} />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      icon: <AlertTriangle className="text-yellow-500" size={24} />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    },
    info: {
      icon: <Info className="text-blue-500" size={24} />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={confirmDialog.onCancel}
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className={`p-4 ${confirmVariantStyles[confirmDialog.variant || 'danger'].bg} ${confirmVariantStyles[confirmDialog.variant || 'danger'].border} border-b`}>
                <div className="flex items-center gap-3">
                  {confirmVariantStyles[confirmDialog.variant || 'danger'].icon}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {confirmDialog.title}
                  </h3>
                </div>
              </div>
              
              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600">{confirmDialog.message}</p>
              </div>
              
              {/* Footer */}
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                  onClick={confirmDialog.onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {confirmDialog.cancelText}
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmVariantStyles[confirmDialog.variant || 'danger'].button}`}
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`pointer-events-auto shadow-lg rounded-lg p-4 flex items-start gap-3 border ${bgColors[toast.type]}`}
            >
              {icons[toast.type]}
              <p className="text-gray-900 text-sm font-medium flex-1 break-words">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white hover:text-gray-600 flex-shrink-0 transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
