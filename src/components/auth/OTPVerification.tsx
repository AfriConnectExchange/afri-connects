import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CustomOTP } from '../ui/custom-otp';
import { AnimatedButton } from '../ui/animated-button';

type Props = any;

export default function OTPVerification({
  formData,
  handleOTPComplete,
  handleResendOTP,
  isLoading,
  onBack
}: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          <AnimatedButton
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </AnimatedButton>

          <CustomOTP
            onComplete={handleOTPComplete}
            onResend={handleResendOTP}
            isLoading={isLoading}
            placeholder={`Enter the 6-digit code sent to ${formData.phone}. Use 123456 for testing.`}
          />
        </div>
      </div>
    </div>
  );
}
