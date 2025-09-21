import React from 'react';
import { Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { AnimatedButton } from '../ui/animated-button';

type Props = any;

export default function SignInCard({
  authMethod,
  setAuthMethod,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  isLoading,
  simulateEmailLogin,
  simulatePhoneAuth,
  showAlert,
  SIMULATION_MODE,
  onSwitch
}: Props) {
  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      <div className="p-8 text-center bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">AC</span>
          </div>
          <span className="text-2xl font-bold text-primary">AfriConnect</span>
        </div>
        <h1 className="text-xl font-semibold mb-2">Welcome Back!</h1>
        <p className="text-sm text-muted-foreground">Sign in to continue your journey</p>
      </div>
      <div className="p-8">
        {/* Method Selection */}
        <div className="flex bg-muted/50 rounded-xl p-1 mb-6">
          {['email', 'phone'].map((method) => (
            <button
              key={method}
              onClick={() => setAuthMethod(method)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                authMethod === method
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {method === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              {method === 'email' ? 'Email' : 'Phone'}
            </button>
          ))}
        </div>
        {/* Form Fields */}
        {authMethod === 'email' ? (
          <form onSubmit={e => { e.preventDefault(); simulateEmailLogin(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={e => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={e => setFormData((prev: any) => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v: boolean) => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <AnimatedButton
              type="submit"
              className="w-full mt-6"
              isLoading={isLoading}
              animationType="glow"
            >
              Sign In
            </AnimatedButton>
          </form>
        ) : (
          <form onSubmit={e => { e.preventDefault(); simulatePhoneAuth(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+44 20 1234 5678"
                value={formData.phone}
                onChange={e => setFormData((prev: any) => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            <AnimatedButton
              type="submit"
              className="w-full mt-6"
              isLoading={isLoading}
              animationType="glow"
            >
              Send Login Code
            </AnimatedButton>
          </form>
        )}
        {/* Additional Options */}
        <div className="mt-6 text-center space-y-2">
          {SIMULATION_MODE && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <strong>Demo Mode:</strong> Use any email/phone. For OTP, use: 123456
            </div>
          )}
          <button
            onClick={() => showAlert('info', 'Password Reset', 'Password reset link would be sent to your email.')}
            className="text-sm text-primary hover:underline"
          >
            Forgot your password?
          </button>
          <div className="text-sm mt-4">
            Don't have an account?{' '}
            <button onClick={onSwitch} className="text-primary hover:underline font-semibold">Sign up</button>
          </div>
        </div>
      </div>
    </div>
  );
}
