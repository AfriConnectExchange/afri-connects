import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronLeft, ChevronRight, Search, ShoppingCart, 
  CreditCard, User, Bell, Play, BookOpen, Truck, Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

interface OnboardingWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onNavigate: (page: string) => void;
}

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  target?: string; // CSS selector for highlighting
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    page: string;
  };
  highlight?: {
    element: string;
    offset?: { x: number; y: number };
  };
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AfriConnect! 🎉',
    description: 'Your trusted marketplace for authentic African products, skills training, and seamless money transfers. Let\'s take a quick tour!',
    icon: Play,
    position: 'center'
  },
  {
    id: 'search',
    title: 'Discover Amazing Products',
    description: 'Use our powerful search to find authentic African products from verified sellers across the continent.',
    icon: Search,
    position: 'top',
    action: {
      label: 'Explore Marketplace',
      page: 'marketplace'
    },
    highlight: {
      element: '[data-tour="search"]',
      offset: { x: 0, y: 60 }
    }
  },
  {
    id: 'cart',
    title: 'Easy Shopping Experience',
    description: 'Add products to your cart with one click. We support multiple payment methods including escrow for your security.',
    icon: ShoppingCart,
    position: 'top',
    action: {
      label: 'View Cart',
      page: 'cart'
    },
    highlight: {
      element: '[data-tour="cart"]',
      offset: { x: 0, y: 60 }
    }
  },
  {
    id: 'payments',
    title: 'Secure Payment Options',
    description: 'Choose from cash on delivery, online payments, or our secure escrow system for complete peace of mind.',
    icon: CreditCard,
    position: 'center'
  },
  {
    id: 'profile',
    title: 'Manage Your Profile',
    description: 'Complete your profile to access all features. Sellers need KYC verification to start selling.',
    icon: User,
    position: 'top',
    action: {
      label: 'Complete Profile',
      page: 'profile'
    },
    highlight: {
      element: '[data-tour="profile"]',
      offset: { x: -120, y: 60 }
    }
  },
  {
    id: 'learning',
    title: 'Learn New Skills',
    description: 'Access courses from African experts to grow your business and develop new skills.',
    icon: BookOpen,
    position: 'center',
    action: {
      label: 'Browse Courses',
      page: 'courses'
    }
  },
  {
    id: 'tracking',
    title: 'Track Your Orders',
    description: 'Get real-time updates on your orders with our integrated tracking system.',
    icon: Truck,
    position: 'center',
    action: {
      label: 'Track Orders',
      page: 'tracking'
    }
  },
  {
    id: 'security',
    title: 'Trust & Security',
    description: 'All sellers are verified through KYC, and we use secure escrow payments to protect your purchases.',
    icon: Shield,
    position: 'center'
  },
  {
    id: 'notifications',
    title: 'Stay Updated',
    description: 'Get notified about order updates, new products, and special offers from your favorite sellers.',
    icon: Bell,
    position: 'top',
    highlight: {
      element: '[data-tour="notifications"]',
      offset: { x: -60, y: 60 }
    }
  }
];

export function OnboardingWalkthrough({ 
  isOpen, 
  onClose, 
  onComplete, 
  onNavigate 
}: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Scroll to top when walkthrough starts
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleActionClick = (action: { label: string; page: string }) => {
    handleComplete();
    onNavigate(action.page);
  };

  const currentStepData = walkthroughSteps[currentStep];
  const progress = ((currentStep + 1) / walkthroughSteps.length) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Highlight Effect */}
          {currentStepData.highlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 pointer-events-none"
            >
              <div 
                className="absolute border-2 border-primary rounded-lg bg-primary/10"
                style={{
                  // This would need to be calculated based on the target element
                  // For demo purposes, using fixed positions
                  top: currentStep === 1 ? '80px' : 
                       currentStep === 2 ? '20px' : 
                       currentStep === 4 ? '20px' : 
                       currentStep === 8 ? '20px' : '50%',
                  right: currentStep === 2 ? '20px' : 
                         currentStep === 4 ? '20px' : 
                         currentStep === 8 ? '20px' : 'auto',
                  left: currentStep === 1 ? '50%' : 'auto',
                  transform: currentStep === 1 ? 'translateX(-50%)' : 'none',
                  width: currentStep === 1 ? '300px' : 
                         currentStep === 2 ? '60px' : 
                         currentStep === 4 ? '60px' : 
                         currentStep === 8 ? '60px' : '200px',
                  height: '50px',
                  animation: 'pulse 2s infinite'
                }}
              />
            </motion.div>
          )}

          {/* Walkthrough Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-50 ${
              currentStepData.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
              currentStepData.position === 'top' ? 'top-32 left-1/2 -translate-x-1/2' :
              currentStepData.position === 'bottom' ? 'bottom-32 left-1/2 -translate-x-1/2' :
              currentStepData.position === 'left' ? 'top-1/2 left-8 -translate-y-1/2' :
              'top-1/2 right-8 -translate-y-1/2'
            }`}
          >
            <Card className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] shadow-2xl border-2">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Step {currentStep + 1} of {walkthroughSteps.length}
                    </Badge>
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkip}
                    className="w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
                      <currentStepData.icon className="w-8 h-8 text-primary" />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-center mb-3">
                      {currentStepData.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-center leading-relaxed mb-6">
                      {currentStepData.description}
                    </p>

                    {/* Action Button */}
                    {currentStepData.action && (
                      <div className="text-center mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActionClick(currentStepData.action!)}
                          className="gap-2"
                        >
                          {currentStepData.action.label}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      className="text-muted-foreground"
                    >
                      Skip Tour
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="gap-1"
                    >
                      {currentStep === walkthroughSteps.length - 1 ? 'Get Started' : 'Next'}
                      {currentStep !== walkthroughSteps.length - 1 && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-background/90 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                {walkthroughSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}