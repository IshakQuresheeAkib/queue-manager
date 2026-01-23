'use client';

import { AlertCircle, CheckCircle, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { motion } from 'framer-motion';


const Toast: React.FC<{
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <AlertCircle className="text-blue-500" size={20} />
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
      className="fixed top-4 left-1/2 z-50 bg-white shadow-lg rounded-lg p-4 flex items-center gap-3 min-w-[300px]"
    >
      {icons[type]}
      <p className="text-gray-900 font-medium">{message}</p>
      <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
        <X size={18} />
      </button>
    </motion.div>
  );
};

export default Toast;