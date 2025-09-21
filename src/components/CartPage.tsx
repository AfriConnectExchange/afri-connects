import { useState } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, CreditCard, Truck, Shield, Tag } from 'lucide-react';
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

interface CartPageProps {
  onNavigate: (page: string) => void;
  cartItems: CartItem[];
  onUpdateCart: (items: CartItem[]) => void;
}

interface CartItem {
  id: number;
  name: string;
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

export function CartPage({ onNavigate, cartItems, onUpdateCart }: CartPageProps) {
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
    
    // Mock promo code validation
    const validCodes = {
      'WELCOME10': 0.1,
      'AFRICONNECT15': 0.15,
      'FIRSTBUY20': 0.2
    };
    
    if (validCodes[promoCode.toUpperCase() as keyof typeof validCodes]) {
      setPromoDiscount(validCodes[promoCode.toUpperCase() as keyof typeof validCodes]);
    } else if (promoCode.trim()) {
      setPromoError('Invalid promo code');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const baseShipping = cartItems.reduce((sum, item) => sum + (item.shippingCost || 0), 0);
    const shippingMultiplier = selectedShipping === 'express' ? 1.5 : selectedShipping === 'overnight' ? 2.5 : 1;
    return baseShipping * shippingMultiplier;
  };

  const calculateDiscount = () => {
    return calculateSubtotal() * promoDiscount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const discount = calculateDiscount();
    return subtotal + shipping - discount;
  };

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
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setShowCheckoutConfirm(false);
    setIsProcessing(false);
    onNavigate('checkout');
  };

  const getShippingInfo = () => {
    switch (selectedShipping) {
      case 'express':
        return { name: 'Express Delivery', time: '2-3 business days', cost: 'Standard + 50%' };
      case 'overnight':
        return { name: 'Overnight Delivery', time: '1 business day', cost: 'Standard + 150%' };
      default:
        return { name: 'Standard Delivery', time: '5-7 business days', cost: 'As listed' };
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('marketplace')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
          </div>

          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added anything to your cart yet
              </p>
              <Button onClick={() => onNavigate('marketplace')} className="w-full">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('marketplace')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary">{cartItems.length} items</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cart Items</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearCart}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium line-clamp-2">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">Sold by {item.seller}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {item.category}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {item.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(item.originalPrice)}
                                </span>
                              )}
                              <span className="font-semibold">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Total: {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                        
                        {!item.inStock && (
                          <Alert className="mt-2" variant="destructive">
                            <AlertDescription>This item is currently out of stock</AlertDescription>
                          </Alert>
                        )}
                        
                        {item.estimatedDelivery && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Estimated delivery: {item.estimatedDelivery}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < cartItems.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                  </div>
                  <Button onClick={applyPromoCode} variant="outline">
                    Apply
                  </Button>
                </div>
                {promoError && (
                  <p className="text-sm text-destructive mt-2">{promoError}</p>
                )}
                {promoDiscount > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    Promo code applied! {(promoDiscount * 100)}% discount
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatPrice(calculateSubtotal())}</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shipping">Shipping Options</Label>
                  <Select value={selectedShipping} onValueChange={setSelectedShipping}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard (5-7 days) - {getShippingInfo().cost}
                      </SelectItem>
                      <SelectItem value="express">
                        Express (2-3 days) - Standard + 50%
                      </SelectItem>
                      <SelectItem value="overnight">
                        Overnight (1 day) - Standard + 150%
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {getShippingInfo().name} - {getShippingInfo().time}
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(calculateShipping())}</span>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({(promoDiscount * 100)}%)</span>
                    <span>-{formatPrice(calculateDiscount())}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
                
                <div className="space-y-3 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreeToTerms}
                      onCheckedChange={setAgreeToTerms}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the Terms of Service and Privacy Policy
                    </Label>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleProceedToCheckout}
                    disabled={!agreeToTerms || cartItems.some(item => !item.inStock)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security & Trust */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Reliable delivery tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Multiple payment options</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">You might also like</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2].map((item) => (
                    <div key={item} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Recommended Product {item}</p>
                        <p className="text-xs text-muted-foreground">£42.50</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Modals */}
        <DeleteConfirmation
          isOpen={showRemoveConfirm.isOpen}
          onClose={() => setShowRemoveConfirm({ isOpen: false, itemId: 0, itemName: '' })}
          onConfirm={confirmRemoveItem}
          itemName={showRemoveConfirm.itemName}
          itemType="item from cart"
        />

        <ConfirmationModal
          isOpen={showClearCartConfirm}
          onClose={() => setShowClearCartConfirm(false)}
          onConfirm={confirmClearCart}
          type="destructive"
          title="Clear Cart"
          description={`Are you sure you want to remove all ${cartItems.length} items from your cart?`}
          confirmText="Clear All Items"
          consequences={[
            'All items will be removed from your cart',
            'You will need to re-add items to shop again',
            'Any applied promo codes will be lost'
          ]}
        />

        <ConfirmationModal
          isOpen={showCheckoutConfirm}
          onClose={() => setShowCheckoutConfirm(false)}
          onConfirm={confirmProceedToCheckout}
          type="warning"
          title="Proceed to Checkout"
          description={`Continue with your order of ${cartItems.length} items (Total: ${formatPrice(calculateTotal())})?`}
          confirmText="Proceed to Payment"
          details={[
            `${cartItems.length} items in cart`,
            `Subtotal: ${formatPrice(calculateSubtotal())}`,
            `Shipping: ${formatPrice(calculateShipping())}`,
            `Total: ${formatPrice(calculateTotal())}`
          ]}
          isLoading={isProcessing}
          loadingText="Preparing checkout..."
        />
      </div>
    </div>
  );
}