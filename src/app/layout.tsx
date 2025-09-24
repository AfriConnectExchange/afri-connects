import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/utils/auth/context";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/ui/cookie-consent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Afri-Connect",
  description: "Connecting Africa to the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const handleNavigate = (page: string) => {
    // This will be replaced by Next.js Link components
    console.log("Navigating to", page);
  };
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Header
              currentPage={"home"} // This can be dynamic with usePathname
              onNavigate={handleNavigate}
              cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            />
            <main className="flex-grow">{children}</main>
            <Footer onNavigate={handleNavigate} />
            <Toaster />
            <CookieConsent onAccept={handleCookieAccept} onDecline={handleCookieDecline} />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
