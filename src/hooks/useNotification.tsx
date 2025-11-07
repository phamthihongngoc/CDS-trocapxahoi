import { useState, useCallback } from 'react';
import Toast, { type ToastType } from '../components/Toast';
import ConfirmModal, { type ConfirmType } from '../components/ConfirmModal';

interface ToastState {
  message: string;
  type: ToastType;
  show: boolean;
}

interface ConfirmState {
  title: string;
  message: string;
  type: ConfirmType;
  show: boolean;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', show: false });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, show: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const ToastComponent = toast.show ? (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={hideToast}
    />
  ) : null;

  return {
    showToast,
    showSuccess: (message: string) => showToast(message, 'success'),
    showError: (message: string) => showToast(message, 'error'),
    showWarning: (message: string) => showToast(message, 'warning'),
    showInfo: (message: string) => showToast(message, 'info'),
    ToastComponent
  };
};

export const useConfirm = () => {
  const [confirm, setConfirm] = useState<ConfirmState>({
    title: '',
    message: '',
    type: 'warning',
    show: false,
    onConfirm: () => {},
    confirmText: 'Xác nhận',
    cancelText: 'Hủy'
  });

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      type?: ConfirmType;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    setConfirm({
      title,
      message,
      type: options?.type || 'warning',
      show: true,
      onConfirm,
      confirmText: options?.confirmText || 'Xác nhận',
      cancelText: options?.cancelText || 'Hủy'
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirm(prev => ({ ...prev, show: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    confirm.onConfirm();
    hideConfirm();
  }, [confirm, hideConfirm]);

  const ConfirmComponent = confirm.show ? (
    <ConfirmModal
      title={confirm.title}
      message={confirm.message}
      type={confirm.type}
      confirmText={confirm.confirmText}
      cancelText={confirm.cancelText}
      onConfirm={handleConfirm}
      onCancel={hideConfirm}
    />
  ) : null;

  return {
    showConfirm,
    ConfirmComponent
  };
};
