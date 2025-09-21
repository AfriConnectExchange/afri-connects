import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ShieldCheck, Settings, Info } from 'lucide-react';
import { Button } from './button';
import { Separator } from './separator';
import { Switch } from './switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from './dialog';

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
  onDecline: () => void;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    const consentGiven = localStorage.getItem('africonnect-cookie-consent');
    if (!consentGiven) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = { necessary: true, analytics: true, marketing: true, preferences: true };
    finalizeConsent(allAccepted);
  };

  const handleDeclineAll = () => {
    const onlyNecessary: CookiePreferences = { necessary: true, analytics: false, marketing: false, preferences: false };
    onDecline();
    finalizeConsent(onlyNecessary, false);
  };
  
  const handleAcceptSelected = () => {
    finalizeConsent(preferences);
  };

  const finalizeConsent = (finalPreferences: CookiePreferences, wasAccepted: boolean = true) => {
    if (wasAccepted) {
      onAccept(finalPreferences);
    }
    setIsVisible(false);
    localStorage.setItem('africonnect-cookie-consent', JSON.stringify(finalPreferences));
  };
  
  const updatePreference = (key: keyof Omit<CookiePreferences, 'necessary'>, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <Dialog>
        {/* Floating Banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)] max-w-md rounded-xl border bg-background/80 p-5 shadow-2xl backdrop-blur-lg md:w-full"
        >
          <div className="flex items-center gap-3 mb-2">
            <Cookie className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">We Use Cookies</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Our website uses cookies to enhance your experience and analyze traffic. You can choose to accept all cookies or customize your settings.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleAcceptAll} className="w-full sm:w-auto flex-1">Accept All</Button>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">Customize</Button>
            </DialogTrigger>
          </div>
        </motion.div>

        {/* Customization Dialog */}
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Customize Your Cookie Preferences</DialogTitle>
            <DialogDescription>
              Choose which types of cookies you want to enable. Necessary cookies are required for the site to function.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <CookieCategory
              icon={ShieldCheck}
              title="Necessary Cookies"
              description="These are essential for the website to function and cannot be disabled."
              switchProps={{ checked: true, disabled: true }}
            />
            <CookieCategory
              icon={Info}
              title="Analytics Cookies"
              description="Help us understand how you use our site to improve performance."
              switchProps={{ 
                checked: preferences.analytics, 
                onCheckedChange: (checked) => updatePreference('analytics', checked) 
              }}
            />
            <CookieCategory
              icon={Settings}
              title="Preference Cookies"
              description="Remember your settings and preferences for a more personalized experience."
              switchProps={{ 
                checked: preferences.preferences, 
                onCheckedChange: (checked) => updatePreference('preferences', checked) 
              }}
            />
            <CookieCategory
              icon={Cookie}
              title="Marketing Cookies"
              description="Used to deliver relevant ads and measure the effectiveness of campaigns."
              switchProps={{ 
                checked: preferences.marketing, 
                onCheckedChange: (checked) => updatePreference('marketing', checked) 
              }}
            />
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full">
            <DialogClose asChild>
                <Button variant="outline" onClick={handleDeclineAll}>Decline All</Button>
            </DialogClose>
            <div className="flex gap-2 mb-2 sm:mb-0">
                <DialogClose asChild>
                    <Button variant="secondary" onClick={handleAcceptSelected}>Save Preferences</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button onClick={handleAcceptAll}>Accept All</Button>
                </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}

// Helper component for cleaner code in the dialog
function CookieCategory({ icon: Icon, title, description, switchProps }: {
  icon: React.ElementType,
  title: string,
  description: string,
  switchProps: React.ComponentProps<typeof Switch>
}) {
  return (
    <div className="flex items-start justify-between rounded-lg border p-4">
      <div className="flex items-start gap-4 pr-4">
        <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch {...switchProps} />
    </div>
  )
}