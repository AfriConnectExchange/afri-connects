import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer'; // Import the new Footer
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { MarketplacePage } from './components/MarketplacePage';
import { ProductPage } from './components/ProductPage';
import { ProfilePage } from './components/ProfilePage';
import { KYCPage } from './components/KYCPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { TransactionHistoryPage } from './components/TransactionHistoryPage';
import { AdvertsPage } from './components/AdvertsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { RemittancePage } from './components/RemittancePage';
import { ReviewsPage } from './components/ReviewsPage';
import { AdminPage } from './components/AdminPage';
import { SupportPage } from './components/SupportPage';
import { CoursesPage } from './components/CoursesPage';
import { MessagingPage } from './components/MessagingPage';
import { OrderTrackingPage } from './components/OrderTrackingPage';
import { HelpCenterPage } from './components/HelpCenterPage';
import { OnboardingWalkthrough } from './components/onboarding/OnboardingWalkthrough';
import { CookieConsent } from './components/ui/cookie-consent';
import { LoadingSpinner, PageLoader } from './components/LoadingSpinner';
import { ErrorBoundary, SimpleErrorFallback } from './components/ui/error-boundary';
import { AuthProvider } from './utils/auth/context';
import { initializeHealthCheck } from './utils/api/health-check';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState<any>(null);
  const [forceShowCookies, setForceShowCookies] = useState(false);

  // Simulate initial app loading and check for first-time user
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize API health check
        await initializeHealthCheck();
        
        // Check if user has seen onboarding before
        const hasSeenOnboarding = localStorage.getItem('africonnect-onboarding-completed');
  // Read simulation flags from URL query params (e.g., ?simulateOnboarding=1 or ?simulateCookies=1)
  const params = new URLSearchParams(window.location.search);
        const simulateOnboarding = params.get('simulateOnboarding') === '1';
        const simulateCookies = params.get('simulateCookies') === '1';

        if (simulateOnboarding) {
          setIsFirstTimeUser(true);
          setShowOnboarding(true);
        } else if (!hasSeenOnboarding) {
          setIsFirstTimeUser(true);
          setShowOnboarding(true);
        }

        if (simulateCookies) {
          setForceShowCookies(true);
        }
      } catch (error) {
        console.warn('App initialization warning:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initializeApp, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (page: string, productId?: number) => {
    setIsPageTransitioning(true);
    
    // Close onboarding if open
    if (showOnboarding) {
      setShowOnboarding(false);
    }
    
    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.scrollTo(0, 0); // Scroll to top on page change
        setCurrentPage(page);
        if (productId) {
          setSelectedProductId(productId);
        } else {
          setSelectedProductId(null);
        }
        setIsPageTransitioning(false);
      }, 200); // Reduced delay
    });
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('africonnect-onboarding-completed', 'true');
    setIsFirstTimeUser(false);
    setShowOnboarding(false);
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  const handleCookieAccept = (preferences: any) => {
    setCookiePreferences(preferences);
    // Initialize analytics, marketing, etc. based on preferences
    if (preferences.analytics) {
      console.log('Analytics tracking enabled');
    }
    if (preferences.marketing) {
      console.log('Marketing tracking enabled');
    }
    if (preferences.preferences) {
      console.log('Preference tracking enabled');
    }
  };

  const handleCookieDecline = () => {
    setCookiePreferences({ necessary: true, analytics: false, marketing: false, preferences: false });
    console.log('Only necessary cookies accepted');
  };

  const handleAddToCart = (product: any) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const renderPage = () => {
    if (isPageTransitioning) {
      return <div className="min-h-screen"><PageLoader /></div>;
    }

    try {
      switch (currentPage) {
        case 'auth':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <AuthPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'profile':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <ProfilePage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'kyc':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <KYCPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'marketplace':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <MarketplacePage 
                onNavigate={handleNavigate} 
                onAddToCart={handleAddToCart}
              />
            </ErrorBoundary>
          );
        case 'product':
          return selectedProductId ? (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <ProductPage 
                productId={selectedProductId}
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
              />
            </ErrorBoundary>
          ) : (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <HomePage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'courses':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <CoursesPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'money-transfer':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <RemittancePage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'tracking':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <OrderTrackingPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'help':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <HelpCenterPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'cart':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <CartPage 
                cartItems={cartItems}
                onNavigate={handleNavigate}
                onUpdateCart={setCartItems}
              />
            </ErrorBoundary>
          );
        case 'checkout':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <CheckoutPage 
                cartItems={cartItems}
                onNavigate={handleNavigate}
                onUpdateCart={setCartItems}
              />
            </ErrorBoundary>
          );
        case 'transactions':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <TransactionHistoryPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'adverts':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <AdvertsPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'notifications':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <NotificationsPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'analytics':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <AnalyticsPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'reviews':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <ReviewsPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'admin':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <AdminPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'support':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <SupportPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        case 'messages':
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <MessagingPage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
        default:
          return (
            <ErrorBoundary fallback={SimpleErrorFallback}>
              <HomePage onNavigate={handleNavigate} />
            </ErrorBoundary>
          );
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return <SimpleErrorFallback error={error as Error} reset={() => window.location.reload()} />;
    }
  };

  // Show initial loading screen
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ErrorBoundary 
      onError={(error, errorInfo) => {
        console.error('App-level error:', error, errorInfo);
        // You could send this to an error reporting service
      }}
    >
      <AuthProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <ErrorBoundary fallback={SimpleErrorFallback}>
            <Header 
              currentPage={currentPage}
              onNavigate={handleNavigate}
              cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            />
          </ErrorBoundary>
          
          <main className="flex-grow">
            {renderPage()}
          </main>
          
          {/* Onboarding Walkthrough */}
          <ErrorBoundary fallback={SimpleErrorFallback}>
              <OnboardingWalkthrough
                isOpen={showOnboarding}
                onClose={handleOnboardingClose}
                onComplete={handleOnboardingComplete}
                onNavigate={handleNavigate}
              />
          </ErrorBoundary>

          {/* Cookie Consent */}
          <ErrorBoundary fallback={SimpleErrorFallback}>
            <CookieConsent
              onAccept={handleCookieAccept}
              onDecline={handleCookieDecline}
              forceOpen={forceShowCookies}
            />
          </ErrorBoundary>
          
          {/* NEW: Added the Footer component */}
          <ErrorBoundary fallback={SimpleErrorFallback}>
            <Footer onNavigate={handleNavigate} />
          </ErrorBoundary>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}
