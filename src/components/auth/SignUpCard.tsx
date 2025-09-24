// FILE: src/components/auth/SignUpCard.tsx
import React from 'react';
import { Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { AnimatedButton } from '../ui/animated-button';

// 1. Import the new component and its styles
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../styles/phone-input.css'; // Adjust the path if needed

type Props = any;

export default function SignUpCard({
  authMethod,
  setAuthMethod,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isLoading,
  handleEmailRegistration,
  simulatePhoneAuth,
  showAlert,
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
        <h1 className="text-xl font-semibold mb-2">Join AfriConnect</h1>
        <p className="text-sm text-muted-foreground">Connect, trade, and thrive across Africa</p>
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
          <form onSubmit={e => { e.preventDefault(); handleEmailRegistration(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={e => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData((prev: any) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v: boolean) => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={checked => setFormData((prev: any) => ({ ...prev, acceptTerms: checked }))}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            <AnimatedButton
              type="submit"
              className="w-full mt-6"
              isLoading={isLoading}
              animationType="glow"
            >
              Create Account
            </AnimatedButton>
          </form>
        ) : (
          <form onSubmit={e => { e.preventDefault(); simulatePhoneAuth(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneName">Full Name</Label>
              <Input
                id="phoneName"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={e => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {/* 2. Replace the old Input with the new PhoneInput component */}
              <PhoneInput
                id="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(value) => setFormData((prev: any) => ({ ...prev, phone: value || '' }))}
                defaultCountry="GB" // Default to United Kingdom
                international
                className="h-10 text-sm" // Match height and text size
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="phoneTerms"
                checked={formData.acceptTerms}
                onCheckedChange={checked => setFormData((prev: any) => ({ ...prev, acceptTerms: checked }))}
              />
              <Label htmlFor="phoneTerms" className="text-sm text-muted-foreground">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            <AnimatedButton
              type="submit"
              className="w-full mt-6"
              isLoading={isLoading}
              animationType="glow"
            >
              Send Verification Code
            </AnimatedButton>
          </form>
        )}
        {/* Additional Options */}
        <div className="mt-6 text-center space-y-2">
          <div className="text-sm mt-4">
            Already have an account?{' '}
            <button onClick={onSwitch} className="text-primary hover:underline font-semibold">Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
