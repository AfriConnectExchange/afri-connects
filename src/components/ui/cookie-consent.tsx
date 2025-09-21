import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Shield, Eye, Settings } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { Switch } from './switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';

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

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
  preferences: false
};

export function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if user has already made a choice
    const consentGiven = localStorage.getItem('africonnect-cookie-consent');
    if (!consentGiven) {
      // Show banner after a small delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    setPreferences(allAccepted);
    onAccept(allAccepted);
    setIsVisible(false);
    localStorage.setItem('africonnect-cookie-consent', JSON.stringify(allAccepted));
  };

  const handleAcceptSelected = () => {
    onAccept(preferences);
    setIsVisible(false);
    localStorage.setItem('africonnect-cookie-consent', JSON.stringify(preferences));
  };

  const handleDeclineAll = () => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    onDecline();
    setIsVisible(false);
    localStorage.setItem('africonnect-cookie-consent', JSON.stringify(minimalPreferences));
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border"
      >
        <div className="container mx-auto max-w-6xl">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              {!showDetails ? (
                // Simple Banner
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Cookie className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">We value your privacy</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
                        By clicking "Accept All", you consent to our use of cookies.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetails(true)}
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Customize
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeclineAll}
                    >
                      Decline All
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptAll}
                      className="gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Accept All
                    </Button>
                  </div>
                </div>
              ) : (
                // Detailed Settings
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cookie className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-medium">Cookie Preferences</h3>
                        <p className="text-sm text-muted-foreground">Choose which cookies you want to accept</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDetails(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {/* Necessary Cookies */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">Necessary Cookies</h4>
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Essential for the website to function properly. These cannot be disabled.
                        </p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">Analytics Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          Help us understand how visitors interact with our website by collecting information anonymously.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(checked) => updatePreference('analytics', checked)}
                      />
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">Marketing Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          Used to deliver personalized advertisements and measure the effectiveness of advertising campaigns.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.marketing}
                        onCheckedChange={(checked) => updatePreference('marketing', checked)}
                      />
                    </div>

                    {/* Preference Cookies */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">Preference Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          Remember your preferences and settings to provide a more personalized experience.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.preferences}
                        onCheckedChange={(checked) => updatePreference('preferences', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="flex gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            Privacy Policy
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Privacy Policy</DialogTitle>
                            <DialogDescription>
                              How we collect, use, and protect your information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 text-sm">
                            <div>
                              <h4 className="font-medium mb-2">Information We Collect</h4>
                              <p className="text-muted-foreground">
                                We collect information you provide directly to us, information we obtain automatically when you use our services, 
                                and information from third parties.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">How We Use Your Information</h4>
                              <p className="text-muted-foreground">
                                We use the information we collect to provide, maintain, and improve our services, process transactions, 
                                send communications, and comply with legal requirements.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Data Security</h4>
                              <p className="text-muted-foreground">
                                We implement appropriate technical and organizational measures to protect your personal data against 
                                unauthorized access, alteration, disclosure, or destruction.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeclineAll}
                      >
                        Decline All
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAcceptSelected}
                      >
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}