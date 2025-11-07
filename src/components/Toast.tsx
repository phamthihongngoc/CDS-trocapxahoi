import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
      iconColor: 'text-white',
      borderColor: 'border-green-400'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-gradient-to-r from-red-500 to-rose-600',
      iconColor: 'text-white',
      borderColor: 'border-red-400'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      iconColor: 'text-white',
      borderColor: 'border-yellow-400'
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      iconColor: 'text-white',
      borderColor: 'border-blue-400'
    }
  };

  const Icon = config[type].icon;

  return (
    <div className="fixed top-20 right-4 z-[9999] animate-slide-in-right">
      <div className={`${config[type].bgColor} text-white px-6 py-4 rounded-xl shadow-2xl border-2 ${config[type].borderColor} backdrop-blur-sm flex items-center gap-3 min-w-[320px] max-w-md`}>
        <div className="flex-shrink-0">
          <Icon className={`w-6 h-6 ${config[type].iconColor} animate-bounce-small`} />
        </div>
        <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
