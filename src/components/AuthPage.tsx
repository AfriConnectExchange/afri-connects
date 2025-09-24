import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, ArrowLeft, Mail, Phone, Loader2, AlertCircle, CheckCircle, User, Building, GraduationCap, ShoppingBag } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CustomAlert } from './ui/custom-alert';
import { CustomModal } from './ui/custom-modal';
import SignInCard from './auth/SignInCard';
import SignUpCard from './auth/SignUpCard';
import OTPVerification from './auth/OTPVerification';
import { AnimatedButton } from './ui/animated-button';
import { useAuth } from '../utils/auth/context';
import { useSignUp, useSignIn } from '../utils/api/hooks';

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
  const [showSignIn, setShowSignIn] = useState(true); // true = sign in, false = sign up
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { mutate: signUp, loading: signUpLoading, error: signUpError, reset: resetSignUp } = useSignUp();
  const { mutate: signIn, loading: signInLoading, error: signInError, reset: resetSignIn } = useSignIn();

  const isLoading = signUpLoading || signInLoading;

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

  // Determine authType based on showSignIn state
  const authType: AuthType = showSignIn ? 'login' : 'register';
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

  useEffect(() => {
    if (signUpError) {
      showAlert('error', 'Registration Failed', signUpError);
      resetSignUp();
    }
    if (signInError) {
      showAlert('error', 'Sign-in Failed', signInError);
      resetSignIn();
    }
  }, [signUpError, signInError]);


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

  // NEW: Real sign in logic
  const handleEmailLogin = async () => {
    if (!validateEmail(formData.email)) {
      showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!formData.password) {
      showAlert('error', 'Password Required', 'Please enter your password.');
      return;
    }

    const result = await signIn({ email: formData.email, password: formData.password });
    if (result) {
      showAlert('success', 'Welcome Back!', 'You have successfully signed in.');
      // The onAuthStateChange listener in AuthProvider will handle navigation
    }
  };

  // NEW: Real registration logic
  const handleEmailRegistration = async () => {
    if (!validateEmail(formData.email)) {
      showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showAlert('error', 'Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (!formData.acceptTerms) {
      showAlert('error', 'Terms Required', 'Please accept the terms and conditions.');
      return;
    }

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      name: formData.name
    });

    if (result) {
      showAlert('success', 'Account Created!', 'You can now sign in with your new account.');
      setShowSignIn(true); // Switch to sign-in view
    }
  };


  const simulatePhoneAuth = async () => {
    if (!validatePhone(formData.phone)) {
      showAlert('error', 'Invalid Phone', 'Please enter a valid phone number.');
      return;
    }
    showAlert('success', 'OTP Sent!', `Verification code sent to ${formData.phone}`);
    setStep('verify-otp');
  };

  const handleOTPComplete = async (otp: string) => {
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
  };

  const simulateCompleteProfile = async () => {
    if (!formData.firstName || !formData.lastName) {
      showAlert('error', 'Name Required', 'Please enter your first and last name.');
      return;
    }

    setStep('success');
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

  // Email verification screen (can be removed if auto-confirming, but good to keep for later)
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
      <OTPVerification
        formData={formData}
        handleOTPComplete={handleOTPComplete}
        handleResendOTP={handleResendOTP}
        isLoading={isLoading}
        onBack={() => setStep('auth')}
      />
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

  // Main auth screen with separate cards
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Back Button - now inside card, absolutely positioned */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-4 left-4 z-10"
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

        {/* Main Card: Sign In or Sign Up */}
        {showSignIn ? (
          <SignInCard
            authMethod={authMethod}
            setAuthMethod={setAuthMethod}
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            handleEmailLogin={handleEmailLogin}
            simulatePhoneAuth={simulatePhoneAuth}
            showAlert={showAlert}
            onSwitch={() => setShowSignIn(false)}
          />
        ) : (
          <SignUpCard
            authMethod={authMethod}
            setAuthMethod={setAuthMethod}
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            isLoading={isLoading}
            handleEmailRegistration={handleEmailRegistration}
            simulatePhoneAuth={simulatePhoneAuth}
            showAlert={showAlert}
            onSwitch={() => setShowSignIn(true)}
          />
        )}

        {/* Custom Alert */}
        <CustomAlert
          isOpen={alertState.isOpen}
          onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
          autoClose={alertState.type === 'success'}
        />
      </motion.div>
    </div>
  );

}
