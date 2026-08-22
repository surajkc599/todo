import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: ToastType;
  duration?: number;
}

export function Toast({
  message,
  isVisible,
  onClose,
  type = 'success',
  duration = 2000,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-green-600',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-600',
      icon: '✕',
    },
    warning: {
      bg: 'bg-amber-600',
      icon: '!',
    },
  };

  const style = styles[type];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`${style.bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300`}>
        <span className="text-lg font-bold">{style.icon}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
