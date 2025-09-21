import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { PaymentMethodSelector } from './payments/PaymentMethodSelector';
import { CashOnDeliveryForm } from './payments/CashOnDeliveryForm';
import { OnlinePaymentForm } from './payments/OnlinePaymentForm';
import { EscrowPaymentForm } from './payments/EscrowPaymentForm';
import { BarterProposalForm } from './payments/BarterProposalForm';
import { PaymentConfirmation } from './payments/PaymentConfirmation';
import { ArrowLeft, ShoppingCart, MapPin, Truck } from 'lucide-react';
import { PaymentConfirmation as PaymentConfirmationModal } from './ui/confirmation-modal';

interface CheckoutPageProps {
  cartItems: any[];
  onNavigate: (page: string) => void;
  onUpdateCart: (items: any[]) => void;
}

export function CheckoutPage({ cartItems, onNavigate, onUpdateCart }: CheckoutPageProps) {
  const [currentStep, setCurrentStep] = useState<'summary' | 'payment' | 'confirmation'>('summary');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderData, setOrderData] = useState({
    deliveryAddress: {
      street: '123 Example Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      phone: '+44 7700 900123'
    }
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + deliveryFee;

  // Auto-navigate to cart if empty
  useEffect(() => {
    if (cartItems.length === 0) {
      onNavigate('cart');
    }
  }, [cartItems, onNavigate]);

  const handlePaymentMethodSelect = (method: any) => {
    setSelectedPaymentMethod(method);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (data: any) => {
    setPaymentData(data);
    setShowPaymentConfirm(true);
  };

  const handlePaymentConfirm = async () => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowPaymentConfirm(false);
    setIsProcessingPayment(false);
    setCurrentStep('confirmation');
    
    // Clear cart after successful payment
    setTimeout(() => {
      onUpdateCart([]);
    }, 2000);
  };

  const handleBackToPaymentSelection = () => {
    setSelectedPaymentMethod(null);
    setCurrentStep('summary');
  };

  const renderPaymentForm = () => {
    if (!selectedPaymentMethod) return null;

    const props = {
      orderTotal: total,
      onConfirm: handlePaymentSubmit,
      onCancel: handleBackToPaymentSelection
    };

    switch (selectedPaymentMethod.type) {
      case 'cash':
        return <CashOnDeliveryForm {...props} />;
      case 'online':
        return (
          <OnlinePaymentForm 
            {...props}
            paymentType={selectedPaymentMethod.id === 'card' ? 'card' : 'wallet'}
          />
        );
      case 'escrow':
        return <EscrowPaymentForm {...props} />;
      case 'barter':
        // For barter, we need to select a product to trade for
        const targetProduct = {
          id: cartItems[0]?.id || 1,
          name: cartItems[0]?.name || 'Product',
          seller: cartItems[0]?.seller || 'Seller',
          estimatedValue: cartItems[0]?.price || total
        };
        return (
          <BarterProposalForm 
            targetProduct={targetProduct}
            onConfirm={handlePaymentSubmit}
            onCancel={handleBackToPaymentSelection}
          />
        );
      default:
        return null;
    }
  };

  if (currentStep === 'confirmation' && paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <PaymentConfirmation 
            paymentData={paymentData}
            orderItems={cartItems}
            orderTotal={total}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('cart')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cart</span>
            </Button>
            <h1 className="text-xl font-semibold">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 'summary' && (
              <>
                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Delivery Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{orderData.deliveryAddress.street}</p>
                      <p>{orderData.deliveryAddress.city}, {orderData.deliveryAddress.postcode}</p>
                      <p className="text-sm text-muted-foreground">{orderData.deliveryAddress.phone}</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      Change Address
                    </Button>
                  </CardContent>
                </Card>

                {/* Delivery Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Truck className="w-5 h-5" />
                      <span>Delivery Options</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium">Standard Delivery</p>
                          <p className="text-sm text-muted-foreground">3-5 business days</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}
                          </p>
                          {deliveryFee === 0 && (
                            <p className="text-xs text-green-600">Orders over £50</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Selection */}
                <PaymentMethodSelector
                  orderTotal={total}
                  onSelectMethod={handlePaymentMethodSelect}
                />
              </>
            )}

            {currentStep === 'payment' && renderPaymentForm()}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs">{item.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Cost Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Badge */}
                {selectedPaymentMethod && (
                  <div className="pt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Payment Method:</span>
                      <Badge variant="secondary">{selectedPaymentMethod.name}</Badge>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="pt-4 text-xs text-muted-foreground">
                  <p>🔒 Your payment information is secure and encrypted</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Confirmation Modal */}
        <PaymentConfirmationModal
          isOpen={showPaymentConfirm}
          onClose={() => setShowPaymentConfirm(false)}
          onConfirm={handlePaymentConfirm}
          amount={`£${total.toFixed(2)}`}
          method={selectedPaymentMethod?.name || 'Payment Method'}
          recipient={cartItems[0]?.seller || 'Seller'}
          isLoading={isProcessingPayment}
        />
      </div>
    </div>
  );
}