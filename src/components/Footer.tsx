import { ArrowRight, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FooterProps {
  onNavigate: (page: string) => void;
}

// App Store badge (from public folder)
const AppStoreButton = () => (
  <a href="#" className="inline-block" aria-label="Download on the App Store">
    <img src="/app-store-badge.png" alt="Download on the App Store" className="h-10 object-contain" />
  </a>
);

// Google Play badge (from public folder)
const GooglePlayButton = () => (
  <a href="#" className="inline-block" aria-label="Get it on Google Play">
    <img src="/playstore-badge.png" alt="Get it on Google Play" className="h-12 object-contain" />
  </a>
);


export function Footer({ onNavigate }: FooterProps) {
  const sponsors = [
    { name: "Sponsor One", logo: "/sponsor-1.jpg" },
    ];

  const footerLinks = {
    platform: [
      { label: "Marketplace", page: "marketplace" },
      { label: "Courses", page: "courses" },
      { label: "Money Transfer", page: "money-transfer" },
      { label: "Order Tracking", page: "tracking" },
    ],
    company: [
      { label: "About Us", page: "about" }, // Assuming an 'about' page
      { label: "Careers", page: "careers" }, // Assuming a 'careers' page
      { label: "Support", page: "support" },
      { label: "Help Center", page: "help" },
    ],
    legal: [
      { label: "Terms of Service", page: "terms" }, // Assuming a 'terms' page
      { label: "Privacy Policy", page: "privacy" }, // Assuming a 'privacy' page
    ]
  };

  return (
    <footer className="bg-muted text-muted-foreground">
      {/* Sponsors Section */}
      <div className="py-8 md:py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <h3 className="text-center text-sm font-semibold tracking-wider text-foreground mb-8">TRUSTED BY PARTNERS ACROSS AFRICA</h3>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {sponsors.map((sponsor) => (
              <ImageWithFallback 
                key={sponsor.name}
                src={sponsor.logo}
                alt={sponsor.name}
                // --- THIS IS THE LINE I CHANGED ---
                className="h-12 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* App Download Section */}
          <div className="md:col-span-4">
            <h4 className="font-semibold text-foreground mb-4">Get the AfriConnect App</h4>
            <p className="text-sm mb-4">
              Access all features on the go. Download our app for a seamless mobile experience.
            </p>
            <div className="flex flex-col sm:flex-row md:flex-col items-start gap-3">
                <AppStoreButton />
                <GooglePlayButton />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h5 className="font-semibold text-foreground mb-4">Platform</h5>
              <ul className="space-y-2">
                {footerLinks.platform.map(link => (
                  <li key={link.page}>
                    <a onClick={() => onNavigate(link.page)} className="text-sm hover:text-primary cursor-pointer transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Company</h5>
              <ul className="space-y-2">
                {footerLinks.company.map(link => (
                  <li key={link.page}>
                    <a onClick={() => onNavigate(link.page)} className="text-sm hover:text-primary cursor-pointer transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Legal</h5>
              <ul className="space-y-2">
                {footerLinks.legal.map(link => (
                  <li key={link.page}>
                    <a onClick={() => onNavigate(link.page)} className="text-sm hover:text-primary cursor-pointer transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-background/50 py-4 border-t border-border/50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="mb-2 sm:mb-0">&copy; {new Date().getFullYear()} AfriConnect. All Rights Reserved.</p>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-primary"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-primary"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-primary"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-primary"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}