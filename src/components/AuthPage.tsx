import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, ArrowLeft, Mail, Phone, Loader2, AlertCircle, CheckCircle, User, Building, GraduationCap, ShoppingBag } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CustomAlert } from './ui/custom-alert';
import { CustomModal } from './ui/custom-modal';
import { CustomOTP } from './ui/custom-otp';
import { AnimatedButton } from './ui/animated-button';
import { useAuth } from '../utils/auth/context';

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

type AuthFlow = 'auth' | 'verify-email' | 'verify-otp' | 'complete-profile' | 'success';
type AuthMethod = 'email' | 'phone';
type AuthType = 'login' | 'register';

interface FormData {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  name: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  role: string;
  otp: string;
  acceptTerms: boolean;
}

// Simulation mode for testing
const SIMULATION_MODE = true;

export function AuthPage({ onNavigate }: AuthPageProps) {
  const { user, session } = useAuth();
  const [step, setStep] = useState<AuthFlow>('auth');
  const [authType, setAuthType] = useState<AuthType>('login');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    address: '',
    postalCode: '',
    role: 'buyer',
    otp: '',
    acceptTerms: false
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && session) {
      onNavigate('profile');
    }
  }, [user, session, onNavigate]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertState({ isOpen: true, type, title, message });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  };

  // Simulation functions
  const simulateEmailLogin = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!validateEmail(formData.email)) {
      showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
      setIsLoading(false);
      return;
    }
    
    if (!formData.password) {
      showAlert('error', 'Password Required', 'Please enter your password.');
      setIsLoading(false);
      return;
    }

    // Simulate successful login
    showAlert('success', 'Welcome Back!', 'You have successfully signed in to AfriConnect.');
    setTimeout(() => {
      onNavigate('home');
    }, 1500);
    setIsLoading(false);
  };

  const simulateEmailRegistration = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!validateEmail(formData.email)) {
      showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
      setIsLoading(false);
      return;
    }
    
    if (!validatePassword(formData.password)) {
      showAlert('error', 'Weak Password', 'Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showAlert('error', 'Password Mismatch', 'Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      showAlert('error', 'Terms Required', 'Please accept the terms and conditions.');
      setIsLoading(false);
      return;
    }

    // Simulate email verification step
    showAlert('success', 'Account Created!', 'Please check your email for verification.');
    setStep('verify-email');
    setIsLoading(false);
  };

  const simulatePhoneAuth = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!validatePhone(formData.phone)) {
      showAlert('error', 'Invalid Phone', 'Please enter a valid phone number.');
      setIsLoading(false);
      return;
    }

    // Simulate OTP sent
    showAlert('success', 'OTP Sent!', `Verification code sent to ${formData.phone}`);
    setStep('verify-otp');
    setIsLoading(false);
  };

  const handleOTPComplete = async (otp: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate OTP verification
    if (otp === '123456') {
      if (authType === 'register') {
        showAlert('success', 'Phone Verified!', 'Your phone number has been verified.');
        setStep('complete-profile');
      } else {
        showAlert('success', 'Welcome Back!', 'You have successfully signed in.');
        setTimeout(() => {
          onNavigate('home');
        }, 1500);
      }
    } else {
      showAlert('error', 'Invalid OTP', 'Please enter the correct verification code. Use 123456 for testing.');
    }
    setIsLoading(false);
  };

  const simulateCompleteProfile = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!formData.firstName || !formData.lastName) {
      showAlert('error', 'Name Required', 'Please enter your first and last name.');
      setIsLoading(false);
      return;
    }

    // Simulate profile completion
    setStep('success');
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    showAlert('info', 'OTP Resent', 'A new verification code has been sent to your phone.');
  };

  const roleIcons = {
    buyer: ShoppingBag,
    seller: User,
    sme: Building,
    trainer: GraduationCap
  };

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center space-y-6 max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <h1 className="text-2xl font-bold text-foreground">Welcome to AfriConnect!</h1>
            <p className="text-muted-foreground">
              Your account has been successfully created. Start exploring the marketplace!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AnimatedButton
              onClick={() => onNavigate('home')}
              className="px-8"
              animationType="glow"
            >
              Explore Marketplace
            </AnimatedButton>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Email verification screen
  if (step === 'verify-email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto"
            >
              <Mail className="w-8 h-8 text-blue-600" />
            </motion.div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Check Your Email</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to<br />
                <span className="font-medium">{formData.email}</span>
              </p>
            </div>

            <div className="space-y-3">
              <AnimatedButton
                onClick={() => setStep('auth')}
                variant="outline"
                className="w-full"
              >
                Try Different Email
              </AnimatedButton>
              <AnimatedButton
                onClick={() => onNavigate('home')}
                variant="ghost"
              >
                Back to Home
              </AnimatedButton>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // OTP verification screen
  if (step === 'verify-otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
            <AnimatedButton
              onClick={() => setStep('auth')}
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
        </motion.div>
      </div>
    );
  }

  // Complete profile screen
  if (step === 'complete-profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
              <p className="text-sm text-muted-foreground">
                Tell us a bit more about yourself
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); simulateCompleteProfile(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ng">🇳🇬 Nigeria</SelectItem>
                    <SelectItem value="gh">🇬🇭 Ghana</SelectItem>
                    <SelectItem value="ke">🇰🇪 Kenya</SelectItem>
                    <SelectItem value="za">🇿🇦 South Africa</SelectItem>
                    <SelectItem value="eg">🇪🇬 Egypt</SelectItem>
                    <SelectItem value="ma">🇲🇦 Morocco</SelectItem>
                    <SelectItem value="et">🇪🇹 Ethiopia</SelectItem>
                    <SelectItem value="tz">🇹🇿 Tanzania</SelectItem>
                    <SelectItem value="ug">🇺🇬 Uganda</SelectItem>
                    <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="What describes you best?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">🛍️ Buyer - I want to shop</SelectItem>
                    <SelectItem value="seller">🏪 Seller - I want to sell products</SelectItem>
                    <SelectItem value="sme">🏢 SME Business - I run a business</SelectItem>
                    <SelectItem value="trainer">🎓 Trainer - I offer courses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <AnimatedButton
                type="submit"
                className="w-full mt-6"
                isLoading={isLoading}
                loadingText="Creating profile..."
                animationType="glow"
              >
                Complete Registration
              </AnimatedButton>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main auth screen with card transitions
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <AnimatedButton
            onClick={() => onNavigate('home')}
            variant="ghost"
            size="icon"
            animationType="slide"
          >
            <ArrowLeft className="w-4 h-4" />
          </AnimatedButton>
        </motion.div>

        {/* Main Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center bg-gradient-to-r from-primary/5 to-secondary/5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AC</span>
              </div>
              <span className="text-2xl font-bold text-primary">AfriConnect</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-xl font-semibold mb-2">
                {authType === 'login' ? 'Welcome Back!' : 'Join AfriConnect'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {authType === 'login' 
                  ? 'Sign in to continue your journey' 
                  : 'Connect, trade, and thrive across Africa'
                }
              </p>
            </motion.div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Auth Type Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex bg-muted rounded-xl p-1 mb-6"
            >
              {(['login', 'register'] as AuthType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAuthType(type)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    authType === type
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </motion.div>

            {/* Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex bg-muted/50 rounded-xl p-1 mb-6"
            >
              {(['email', 'phone'] as AuthMethod[]).map((method) => (
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
            </motion.div>

            {/* Form Fields */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${authType}-${authMethod}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Email Form */}
                {authMethod === 'email' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    authType === 'login' ? simulateEmailLogin() : simulateEmailRegistration();
                  }} className="space-y-4">
                    {authType === 'register' && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {authType === 'register' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                            onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                          />
                          <Label htmlFor="terms" className="text-sm text-muted-foreground">
                            I agree to the Terms of Service and Privacy Policy
                          </Label>
                        </div>
                      </>
                    )}

                    <AnimatedButton
                      type="submit"
                      className="w-full mt-6"
                      isLoading={isLoading}
                      animationType="glow"
                    >
                      {authType === 'login' ? 'Sign In' : 'Create Account'}
                    </AnimatedButton>
                  </form>
                )}

                {/* Phone Form */}
                {authMethod === 'phone' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    simulatePhoneAuth();
                  }} className="space-y-4">
                    {authType === 'register' && (
                      <div className="space-y-2">
                        <Label htmlFor="phoneName">Full Name</Label>
                        <Input
                          id="phoneName"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+44 20 1234 5678"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>

                    {authType === 'register' && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="phoneTerms"
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                        />
                        <Label htmlFor="phoneTerms" className="text-sm text-muted-foreground">
                          I agree to the Terms of Service and Privacy Policy
                        </Label>
                      </div>
                    )}

                    <AnimatedButton
                      type="submit"
                      className="w-full mt-6"
                      isLoading={isLoading}
                      animationType="glow"
                    >
                      {authType === 'login' ? 'Send Login Code' : 'Send Verification Code'}
                    </AnimatedButton>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Additional Options */}
            <div className="mt-6 text-center space-y-2">
              {SIMULATION_MODE && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <strong>Demo Mode:</strong> Use any email/phone. For OTP, use: 123456
                </div>
              )}
              
              {authMethod === 'email' && authType === 'login' && (
                <button
                  onClick={() => showAlert('info', 'Password Reset', 'Password reset link would be sent to your email.')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        autoClose={alertState.type === 'success'}
      />
    </div>
  );
}