import { useState } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, CreditCard, Truck, Shield, Tag, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { ConfirmationModal, DeleteConfirmation } from './ui/confirmation-modal';
import { ImageWithFallback } from './figma/ImageWithFallback';

// --- INTERFACES (No Change) ---
interface CartPageProps {
  onNavigate: (page: string) => void;
  cartItems: CartItem[];
  onUpdateCart: (items: CartItem[]) => void;
}

interface CartItem {
  id: number;
  name:string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: string;
  quantity: number;
  inStock: boolean;
  category: string;
  shippingCost?: number;
  estimatedDelivery?: string;
}

// --- MAIN COMPONENT ---
export function CartPage({ onNavigate, cartItems, onUpdateCart }: CartPageProps) {
  // --- STATE AND LOGIC (No Change) ---
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{ isOpen: boolean; itemId: number; itemName: string }>({
    isOpen: false,
    itemId: 0,
    itemName: ''
  });
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => `£${price.toFixed(2)}`;

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      const item = cartItems.find(item => item.id === itemId);
      if (item) {
        handleRemoveItem(itemId, item.name);
      }
      return;
    }
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    onUpdateCart(updatedItems);
  };

  const handleRemoveItem = (itemId: number, itemName: string) => {
    setShowRemoveConfirm({ isOpen: true, itemId, itemName });
  };

  const confirmRemoveItem = () => {
    const updatedItems = cartItems.filter(item => item.id !== showRemoveConfirm.itemId);
    onUpdateCart(updatedItems);
    setShowRemoveConfirm({ isOpen: false, itemId: 0, itemName: '' });
  };

  const handleClearCart = () => {
    setShowClearCartConfirm(true);
  };

  const confirmClearCart = () => {
    onUpdateCart([]);
    setShowClearCartConfirm(false);
  };

  const applyPromoCode = () => {
    setPromoError('');
    const validCodes = { 'WELCOME10': 0.1, 'AFRICONNECT15': 0.15, 'FIRSTBUY20': 0.2 };
    if (validCodes[promoCode.toUpperCase() as keyof typeof validCodes]) {
      setPromoDiscount(validCodes[promoCode.toUpperCase() as keyof typeof validCodes]);
    } else if (promoCode.trim()) {
      setPromoError('Invalid promo code');
    }
  };

  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const calculateShipping = () => {
    const baseShipping = cartItems.reduce((sum, item) => sum + (item.shippingCost || 0), 0);
    const shippingMultiplier = selectedShipping === 'express' ? 1.5 : selectedShipping === 'overnight' ? 2.5 : 1;
    return baseShipping * shippingMultiplier;
  };

  const calculateDiscount = () => calculateSubtotal() * promoDiscount;
  
  const calculateTotal = () => calculateSubtotal() + calculateShipping() - calculateDiscount();

  const handleProceedToCheckout = () => {
    if (!agreeToTerms) {
      alert('Please accept the terms and conditions to proceed');
      return;
    }
    if (cartItems.some(item => !item.inStock)) {
      alert('Some items in your cart are out of stock. Please remove them to continue.');
      return;
    }
    setShowCheckoutConfirm(true);
  };

  const confirmProceedToCheckout = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowCheckoutConfirm(false);
    setIsProcessing(false);
    onNavigate('checkout');
  };

  // --- SUB-COMPONENTS FOR REDESIGN ---
  
  // New Compact Quantity Stepper
  const QuantityStepper = ({ item }: { item: CartItem }) => (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 rounded-r-none"
        onClick={() => updateQuantity(item.id, item.quantity - 1)}
      >
        <Minus className="w-3 h-3" />
      </Button>
      <div className="w-10 h-7 text-center border-y flex items-center justify-center text-sm font-medium">
        {item.quantity}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 rounded-l-none"
        onClick={() => updateQuantity(item.id, item.quantity + 1)}
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );

  // New Sticky Footer for Mobile
  const StickyMobileFooter = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-10 p-4">
        <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold">{formatPrice(calculateTotal())}</span>
        </div>
        <Button 
          className="w-full font-semibold" 
          size="lg"
          onClick={handleProceedToCheckout}
          disabled={!agreeToTerms || cartItems.some(item => !item.inStock)}
        >
          Proceed to Checkout
        </Button>
    </div>
  );

  // --- RENDER LOGIC ---

  // Empty Cart View (No major changes, just typography)
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('marketplace')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
          </div>
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
              <Button onClick={() => onNavigate('marketplace')} className="w-full">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main Cart View (Redesigned)
  return (
    <>
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6 pb-28 lg:pb-6"> {/* Added padding-bottom for mobile footer */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('marketplace')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary">{cartItems.length} items</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* --- LEFT COLUMN: Cart Items --- */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Cart Items</CardTitle>
                <Button variant="outline" size="sm" onClick={handleClearCart} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </CardHeader>
              <CardContent className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium line-clamp-2 pr-2">{item.name}</h4>
                            <div className="text-right">
                                <div className="font-semibold">{formatPrice(item.price)}</div>
                                {item.originalPrice && (
                                    <div className="text-xs text-muted-foreground line-through">{formatPrice(item.originalPrice)}</div>
                                )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">Sold by {item.seller}</p>
                          <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                        </div>

                        <div className="flex items-end justify-between mt-2">
                           <QuantityStepper item={item} />
                           <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id, item.name)}
                              className="text-muted-foreground hover:text-destructive h-7 w-7"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                      </div>
                    </div>
                    
                    {!item.inStock && (
                      <Alert className="mt-3" variant="destructive">
                        <AlertDescription className="text-xs">This item is currently out of stock</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT COLUMN: Order Summary (Sticky on Desktop) --- */}
          <div className="lg:sticky lg:top-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Promo Code - Integrated */}
                <div className="space-y-2">
                    <Label htmlFor="promo" className="text-xs">Promo Code</Label>
                    <div className="flex gap-2">
                        <Input id="promo" placeholder="Enter code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                        <Button onClick={applyPromoCode} variant="outline">Apply</Button>
                    </div>
                    {promoError && <p className="text-xs text-destructive">{promoError}</p>}
                    {promoDiscount > 0 && <p className="text-xs text-green-600">"{promoCode.toUpperCase()}" applied! ({(promoDiscount * 100)}% off)</p>}
                </div>

                <Separator />
                
                {/* Calculations */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatPrice(calculateShipping())}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-muted-foreground">Discount</span>
                      <span>-{formatPrice(calculateDiscount())}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </CardContent>

              <Separator />

              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(Boolean(checked))} />
                  <Label htmlFor="terms" className="text-xs leading-snug">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
                
                <Button 
                  className="w-full font-semibold" 
                  size="lg"
                  onClick={handleProceedToCheckout}
                  disabled={!agreeToTerms || cartItems.some(item => !item.inStock)}
                >
                  Proceed to Checkout
                </Button>

                {/* Trust Badges */}
                <div className="flex items-center justify-around text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-xs">Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-xs">Fast Shipping</span>
                    </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- Confirmation Modals (Unchanged) --- */}
        <DeleteConfirmation isOpen={showRemoveConfirm.isOpen} onClose={() => setShowRemoveConfirm({ isOpen: false, itemId: 0, itemName: '' })} onConfirm={confirmRemoveItem} itemName={showRemoveConfirm.itemName} itemType="item from cart" />
        <ConfirmationModal isOpen={showClearCartConfirm} onClose={() => setShowClearCartConfirm(false)} onConfirm={confirmClearCart} type="destructive" title="Clear Cart" description={`Are you sure you want to remove all ${cartItems.length} items from your cart?`} confirmText="Clear All Items" />
        <ConfirmationModal isOpen={showCheckoutConfirm} onClose={() => setShowCheckoutConfirm(false)} onConfirm={confirmProceedToCheckout} type="warning" title="Proceed to Checkout" description={`Continue with your order of ${cartItems.length} items (Total: ${formatPrice(calculateTotal())})?`} confirmText="Proceed to Payment" isLoading={isProcessing} loadingText="Preparing checkout..." />
      </div>
    </div>
    <StickyMobileFooter />
    </>
  );
}