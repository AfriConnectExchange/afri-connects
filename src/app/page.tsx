'use client';
import { AdvertsPage } from "@/components/AdvertsPage";
import { AnalyticsPage } from "@/components/AnalyticsPage";
import { CartPage } from "@/components/CartPage";
import { CheckoutPage } from "@/components/CheckoutPage";
import { CoursesPage } from "@/components/CoursesPage";
import { HomePage } from "@/components/HomePage";
import { KYCPage } from "@/components/KYCPage";
import { MarketplacePage } from "@/components/MarketplacePage";
import { MessagingPage } from "@/components/MessagingPage";
import { NotificationsPage } from "@/components/NotificationsPage";
import { OrderTrackingPage } from "@/components/OrderTrackingPage";
import { ProductPage } from "@/components/ProductPage";
import { ProfilePage } from "@/components/ProfilePage";
import { RemittancePage } from "@/components/RemittancePage";
import { ReviewsPage } from "@/components/ReviewsPage";
import { SupportPage } from "@/components/SupportPage";
import { TransactionHistoryPage } from "@/components/TransactionHistoryPage";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [cartItems, setCartItems] = useState<any[]>([]);

  const handleNavigate = (page: string, productId?: number) => {
    if (page === 'product' && productId) {
      router.push(`/product/${productId}`);
    } else {
      router.push(`/${page}`);
    }
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

  // Basic routing based on pathname
  const renderPage = () => {
    switch (pathname) {
      case '/marketplace':
        return <MarketplacePage onNavigate={handleNavigate} onAddToCart={handleAddToCart} />;
      case '/courses':
        return <CoursesPage onNavigate={handleNavigate} />;
      case '/adverts':
        return <AdvertsPage onNavigate={handleNavigate} />;
      case '/analytics':
        return <AnalyticsPage onNavigate={handleNavigate} />;
      case '/remittance':
        return <RemittancePage onNavigate={handleNavigate} />;
      case '/reviews':
        return <ReviewsPage onNavigate={handleNavigate} />;
      case '/support':
        return <SupportPage onNavigate={handleNavigate} />;
      case '/tracking':
        return <OrderTrackingPage onNavigate={handleNavigate} />;
      case '/transactions':
        return <TransactionHistoryPage onNavigate={handleNavigate} />;
      case '/notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case '/messaging':
        return <MessagingPage onNavigate={handleNavigate} />;
      case '/kyc':
        return <KYCPage onNavigate={handleNavigate} />;
      case '/profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case '/cart':
        return <CartPage cartItems={cartItems} onNavigate={handleNavigate} onUpdateCart={setCartItems} />;
      case '/checkout':
        return <CheckoutPage cartItems={cartItems} onNavigate={handleNavigate} onUpdateCart={setCartItems} />;
      default:
        // Handle product pages
        if (pathname.startsWith('/product/')) {
          const productId = parseInt(pathname.split('/')[2]);
          return <ProductPage productId={productId} onNavigate={handleNavigate} onAddToCart={handleAddToCart} />;
        }
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return <>{renderPage()}</>;
}
