import type { Toast as ToastType } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ToastProps {
  toast: ToastType;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast.show) return null;

  // Map icon strings to FontAwesome icon names
  const getIconName = (icon: string) => {
    switch (icon) {
      case '✅':
        return 'check-circle';
      case '❌':
        return 'times-circle';
      case '⚠️':
        return 'exclamation-triangle';
      default:
        return 'info-circle';
    }
  };

  return (
    <div
      className="fixed top-24 right-6 bg-white rounded-xl px-5 py-4 shadow-xl z-[2000] flex items-center gap-3 animate-slide-in"
      style={{ borderLeft: `4px solid ${toast.color}` }}
    >
      <span className="text-xl">
        <FontAwesomeIcon icon={getIconName(toast.icon)} />
      </span>
      <span className="text-gray-800">{toast.message}</span>
    </div>
  );
};

export default Toast;
