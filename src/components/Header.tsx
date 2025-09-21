import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, MapPin, X, Bell, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount: number;
}

export function Header({ currentPage, onNavigate, cartCount }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'courses', label: 'Courses' },
    { id: 'money-transfer', label: 'Send Money' },
    { id: 'adverts', label: 'My Adverts', icon: TrendingUp }
  ];

  const additionalItems = [
    { id: 'tracking', label: 'Track Orders' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'admin', label: 'Admin Panel' },
    { id: 'help', label: 'Help Center' },
    { id: 'support', label: 'Support' }
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar - hidden on mobile */}
        <div className="hidden md:flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Lagos, Nigeria</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Free shipping on orders over £50
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-3 md:py-4 px-2 sm:px-4 md:px-0">
          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="shrink-0" aria-label="Open navigation menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate through different sections of AfriConnect marketplace
              </SheetDescription>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">AC</span>
                </div>
                <span className="text-xl font-bold text-primary">AfriConnect</span>
              </div>
              
              <div className="space-y-4">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleNavigate(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}
                
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-2 px-3">More Features</p>
                  {additionalItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleNavigate(item.id)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigate('notifications')}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigate('cart')}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart ({cartCount})
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigate('profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer flex-1 lg:flex-none justify-center lg:justify-start min-w-0"
            onClick={() => onNavigate('home')}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm sm:text-base">AC</span>
            </div>
            <span className="text-base sm:text-lg lg:text-xl font-bold text-primary truncate">AfriConnect</span>
          </div>

          {/* Desktop Search bar */}
          <div className="hidden lg:block flex-1 max-w-lg mx-6 xl:mx-8" data-tour="search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products, courses, services..."
                className="pl-10 pr-4 h-10"
              />
            </div>
          </div>

          {/* Tablet Search bar */}
          <div className="hidden md:block lg:hidden flex-1 max-w-xs mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search..."
                className="pl-10 pr-4 h-9 text-sm"
              />
            </div>
          </div>

          {/* Mobile search toggle */}
          <div className="md:hidden shrink-0">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="h-9 w-9"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 shrink-0">
            {/* Desktop Navigation items */}
            <div className="hidden lg:flex items-center gap-2">
              {navigationItems.map((item) => (
                <Button 
                  key={item.id}
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className={`${currentPage === item.id ? 'bg-accent' : ''}`}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            
            {/* Cart - visible on md+ */}
            <div className="hidden md:block" data-tour="cart">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9"
                onClick={() => onNavigate('cart')}
                aria-label={`Shopping cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Notifications - visible on md+ */}
            <div className="hidden md:block" data-tour="notifications">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onNavigate('notifications')}
                className="h-9 w-9 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </Button>
            </div>

            {/* User menu - visible on md+ */}
            <div className="hidden md:block" data-tour="profile">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onNavigate('profile')}
                className="h-9 w-9"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Icons (grouped) */}
            <div className="flex md:hidden items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9"
                onClick={() => onNavigate('notifications')}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9"
                onClick={() => onNavigate('cart')}
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onNavigate('profile')}
                className="h-9 w-9"
              >
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products, courses, services..."
                className="pl-10 pr-4"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}