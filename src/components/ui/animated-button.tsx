import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  animationType?: 'scale' | 'slide' | 'bounce' | 'glow';
}

const animationVariants = {
  scale: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  slide: {
    whileHover: { y: -2 },
    whileTap: { y: 0 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  bounce: {
    whileHover: { y: -3, transition: { type: "spring", stiffness: 400 } },
    whileTap: { scale: 0.95 },
  },
  glow: {
    whileHover: { 
      boxShadow: "0 0 20px rgba(var(--primary), 0.3)", 
      transition: { duration: 0.2 } 
    },
    whileTap: { scale: 0.98 },
  }
};

export function AnimatedButton({
  variant = 'default',
  size = 'default',
  isLoading = false,
  loadingText = 'Loading...',
  children,
  className,
  animationType = 'scale',
  disabled,
  ...props
}: AnimatedButtonProps) {
  const isDisabled = disabled || isLoading;
  const animation = animationVariants[animationType];

  return (
    <motion.div
      {...(!isDisabled && animation)}
      className="inline-block"
    >
      <Button
        variant={variant}
        size={size}
        disabled={isDisabled}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isLoading && "cursor-not-allowed",
          animationType === 'glow' && "shadow-lg",
          className
        )}
        {...props}
      >
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={isLoading ? { opacity: 0.7 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.div>
          )}
          <span>{isLoading ? loadingText : children}</span>
        </motion.div>

        {/* Ripple effect overlay */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-md"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.1 }}
          style={{ originX: 0.5, originY: 0.5 }}
        />
      </Button>
    </motion.div>
  );
}