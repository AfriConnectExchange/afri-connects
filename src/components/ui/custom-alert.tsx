import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { Button } from './button';
import { VisuallyHidden } from './visually-hidden';

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-white dark:bg-card',
    borderColor: 'border-border',
    iconColor: 'text-primary',
    titleColor: 'text-foreground',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-white dark:bg-card',
    borderColor: 'border-border',
    iconColor: 'text-primary',
    titleColor: 'text-foreground',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-white dark:bg-card',
    borderColor: 'border-border',
    iconColor: 'text-primary',
    titleColor: 'text-foreground',
  },
  info: {
    icon: Info,
    bgColor: 'bg-white dark:bg-card',
    borderColor: 'border-border',
    iconColor: 'text-primary',
    titleColor: 'text-foreground',
  },
};

export function CustomAlert({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
  actionLabel,
  onAction,
  autoClose = false,
  duration = 5000,
}: CustomAlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Alert */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed top-8 right-8 z-50 w-full max-w-sm"
            role="alert"
            aria-live="assertive"
            aria-labelledby="alert-title"
            aria-describedby="alert-message"
          >
            <div className={`relative rounded-xl border ${config.bgColor} ${config.borderColor} p-4 shadow-lg backdrop-blur-sm`}>
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-black/10"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Content */}
              <div className="flex items-start space-x-4 pr-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className={`flex-shrink-0 ${config.iconColor}`}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                
                <div className="flex-1 space-y-2">
                  <h3 id="alert-title" className={`font-semibold ${config.titleColor}`}>
                    {title}
                  </h3>
                  <p id="alert-message" className="text-sm text-muted-foreground leading-relaxed">
                    {message}
                  </p>
                  
                  {actionLabel && onAction && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="pt-3"
                    >
                      <Button
                        size="sm"
                        onClick={onAction}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {actionLabel}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Progress bar for auto-close */}
              {autoClose && (
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                  className={`absolute bottom-0 left-0 h-1 ${config.iconColor.replace('text-', 'bg-')} rounded-b-xl`}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}