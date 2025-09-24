'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck, Settings, Info } from 'lucide-react';
import { Button } from './button';
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
  /** When true, forces the consent UI to appear regardless of localStorage */
  forceOpen?: boolean;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent({ onAccept, onDecline, forceOpen }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    const consentGiven = localStorage.getItem('africonnect-cookie-consent');
    if (forceOpen) {
      setIsVisible(true);
      return;
    }
    if (!consentGiven) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

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
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] backdrop-blur-sm md:bottom-4 md:right-4 md:max-w-md md:rounded-xl md:border"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">We Value Your Privacy</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We use cookies to enhance your browsing experience and analyze site traffic. Click "Accept All" to consent to our use of cookies.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-shrink-0 gap-2">
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">Customize</Button>
              </DialogTrigger>
              <Button onClick={handleAcceptAll} className="flex-1">Accept All</Button>
            </div>
          </div>
        </motion.div>

        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Customize Cookie Preferences</DialogTitle>
            <DialogDescription>
              Manage your cookie settings below. You can enable or disable different categories of cookies.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <CookieCategory
              icon={ShieldCheck}
              title="Necessary Cookies"
              description="Essential for the website to function properly. These cannot be disabled."
              switchProps={{ checked: true, disabled: true }}
            />
            <CookieCategory
              icon={Info}
              title="Analytics Cookies"
              description="Help us understand how visitors interact with our website by collecting and reporting information anonymously."
              switchProps={{ 
                checked: preferences.analytics, 
                onCheckedChange: (checked) => updatePreference('analytics', checked) 
              }}
            />
            <CookieCategory
              icon={Settings}
              title="Preference Cookies"
              description="Enable the website to remember information that changes the way the site behaves or looks."
              switchProps={{ 
                checked: preferences.preferences, 
                onCheckedChange: (checked) => updatePreference('preferences', checked) 
              }}
            />
            <CookieCategory
              icon={Cookie}
              title="Marketing Cookies"
              description="Used to track visitors across websites to display relevant ads."
              switchProps={{ 
                checked: preferences.marketing, 
                onCheckedChange: (checked) => updatePreference('marketing', checked) 
              }}
            />
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <DialogClose asChild>
                <Button variant="outline" onClick={handleDeclineAll}>Decline All</Button>
            </DialogClose>
            <DialogClose asChild>
                <Button variant="secondary" onClick={handleAcceptSelected}>Save Preferences</Button>
            </DialogClose>
            <DialogClose asChild>
                <Button onClick={handleAcceptAll}>Accept All</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}

function CookieCategory({ icon: Icon, title, description, switchProps }: {
  icon: React.ElementType,
  title: string,
  description: string,
  switchProps: React.ComponentProps<typeof Switch>;
}) {
  return (
    <div className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-start gap-4 pr-4">
        <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch {...switchProps} />
    </div>
  );
}
