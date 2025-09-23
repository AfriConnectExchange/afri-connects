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
        <div className="hidden md:flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Lagos, Nigeria</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Free shipping on orders over £50
          </div>
        </div>

        <div className="flex items-center justify-between py-3 md:py-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="shrink-0" aria-label="Open navigation menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-6 px-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">AC</span>
                  </div>
                  <span className="text-xl font-bold text-primary">AfriConnect</span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={currentPage === item.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-base py-6"
                        onClick={() => handleNavigate(item.id)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="border-t my-4"></div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 px-3">More Features</p>
                    <div className="space-y-1">
                      {additionalItems.map((item) => (
                        <Button
                          key={item.id}
                          variant={currentPage === item.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleNavigate(item.id)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t mt-4 pt-4">
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
                    onClick={() => handleNavigate('profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div 
            className="flex items-center gap-2 cursor-pointer flex-1 lg:flex-none justify-center lg:justify-start min-w-0"
            onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-base">AC</span>
            </div>
            <span className="text-lg lg:text-xl font-bold text-primary truncate">AfriConnect</span>
          </div>

          <div className="hidden lg:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products, courses, services..."
                className="pl-10 pr-4 h-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
            
            <div className="hidden md:flex items-center gap-2">
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
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onNavigate('profile')}
                  className="h-9 w-9"
                >
                  <User className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex md:hidden items-center gap-1">
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
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..."
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