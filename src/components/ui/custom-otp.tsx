import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from './utils';

interface CustomOTPProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend?: () => void;
  isLoading?: boolean;
  error?: string;
  successMessage?: string;
  placeholder?: string;
  className?: string;
}

export function CustomOTP({
  length = 6,
  onComplete,
  onResend,
  isLoading = false,
  error,
  successMessage,
  placeholder = "Enter OTP",
  className,
}: CustomOTPProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    const otpValue = newOtp.join('');
    if (otpValue.length === length) {
      onComplete(otpValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const newOtp = [...otp];
    
    for (let i = 0; i < Math.min(pastedData.length, length); i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    const otpValue = newOtp.join('');
    if (otpValue.length === length) {
      onComplete(otpValue);
    }
  };

  const handleResend = () => {
    if (resendCooldown === 0 && onResend) {
      onResend();
      setResendCooldown(60);
      setOtp(new Array(length).fill(''));
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Enter Verification Code
        </h3>
        <p className="text-sm text-muted-foreground">
          {placeholder}
        </p>
      </div>

      {/* OTP Input Fields */}
      <div className="flex justify-center gap-3">
        {otp.map((digit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <input
              ref={(ref) => (inputRefs.current[index] = ref)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={() => setActiveIndex(index)}
              onPaste={handlePaste}
              disabled={isLoading}
              className={cn(
                "w-12 h-14 text-center text-lg font-semibold rounded-xl border-2 transition-all duration-200",
                "focus:outline-none focus:ring-4 focus:ring-primary/20",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                activeIndex === index
                  ? "border-primary bg-primary/5 scale-105"
                  : "border-border bg-input-background hover:border-primary/50",
                error && "border-destructive bg-destructive/5",
                successMessage && "border-emerald-500 bg-emerald-50",
              )}
            />
          </motion.div>
        ))}
      </div>

      {/* Status Messages */}
      <div className="text-center min-h-[20px]">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive font-medium"
          >
            {error}
          </motion.p>
        )}
        {successMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-emerald-600 font-medium"
          >
            {successMessage}
          </motion.p>
        )}
      </div>

      {/* Resend Button */}
      {onResend && (
        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || isLoading}
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              resendCooldown > 0 || isLoading
                ? "text-muted-foreground cursor-not-allowed"
                : "text-primary hover:text-primary/80 cursor-pointer"
            )}
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Didn't receive code? Resend"}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Verifying...
          </div>
        </motion.div>
      )}
    </div>
  );
}