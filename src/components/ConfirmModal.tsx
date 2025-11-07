import React from 'react';
import { AlertTriangle, HelpCircle, Info, CheckCircle, X } from 'lucide-react';

export type ConfirmType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmModalProps {
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  type = 'warning',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel
}) => {
  const config = {
    danger: {
      icon: AlertTriangle,
      gradient: 'from-red-600 to-rose-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      btnGradient: 'from-red-600 to-rose-600',
      btnHover: 'hover:from-red-700 hover:to-rose-700'
    },
    warning: {
      icon: HelpCircle,
      gradient: 'from-orange-600 to-yellow-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      btnGradient: 'from-orange-600 to-yellow-600',
      btnHover: 'hover:from-orange-700 hover:to-yellow-700'
    },
    info: {
      icon: Info,
      gradient: 'from-blue-600 to-cyan-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      btnGradient: 'from-blue-600 to-cyan-600',
      btnHover: 'hover:from-blue-700 hover:to-cyan-700'
    },
    success: {
      icon: CheckCircle,
      gradient: 'from-green-600 to-emerald-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      btnGradient: 'from-green-600 to-emerald-600',
      btnHover: 'hover:from-green-700 hover:to-emerald-700'
    }
  };

  const { icon: Icon, gradient, iconBg, iconColor, btnGradient, btnHover } = config[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-scaleIn overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${gradient} px-6 py-5`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`${iconBg} bg-opacity-30 p-2.5 rounded-xl`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
              </div>
            </div>
            <button 
              onClick={onCancel} 
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 text-base leading-relaxed">{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold transform hover:scale-[1.02] active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 bg-gradient-to-r ${btnGradient} ${btnHover} text-white rounded-xl transition-all font-bold shadow-lg transform hover:scale-[1.02] active:scale-95`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
