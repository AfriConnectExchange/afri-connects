'use client';
import React from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/utils/auth/context";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/ui/cookie-consent";

export function Providers({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = React.useState(0);

  const handleCookieAccept = (preferences: any) => {
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
    console.log('Only necessary cookies accepted');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header cartCount={cartCount} />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Toaster />
        <CookieConsent onAccept={handleCookieAccept} onDecline={handleCookieDecline} />
      </div>
    </AuthProvider>
  );
}
