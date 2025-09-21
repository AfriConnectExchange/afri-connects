import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Check, CreditCard, Wallet, Shield, Handshake, Truck } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'online' | 'escrow' | 'barter';
  icon: React.ReactNode;
  description: string;
  ranking: number;
  recommended?: boolean;
  maxAmount?: number;
  processingTime: string;
  fees: string;
}

interface PaymentMethodSelectorProps {
  orderTotal: number;
  onSelectMethod: (method: PaymentMethod) => void;
  selectedMethod?: string;
}

export function PaymentMethodSelector({ orderTotal, onSelectMethod, selectedMethod }: PaymentMethodSelectorProps) {
  const [methods] = useState<PaymentMethod[]>([
    {
      id: 'escrow',
      name: 'Escrow Payment',
      type: 'escrow',
      icon: <Shield className="w-5 h-5" />,
      description: 'Secure payment held until delivery confirmed',
      ranking: 1,
      recommended: true,
      processingTime: 'Instant',
      fees: '2.5% + £0.30'
    },
    {
      id: 'card',
      name: 'Card Payment',
      type: 'online',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Pay with Visa, Mastercard or Debit card',
      ranking: 2,
      processingTime: 'Instant',
      fees: '2.9% + £0.30'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      type: 'online',
      icon: <Wallet className="w-5 h-5" />,
      description: 'PayPal, Apple Pay, Google Pay',
      ranking: 3,
      processingTime: 'Instant',
      fees: '3.4% + £0.30'
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      type: 'cash',
      icon: <Truck className="w-5 h-5" />,
      description: 'Pay when you receive your order',
      ranking: 4,
      maxAmount: 1000,
      processingTime: 'On delivery',
      fees: 'Free'
    },
    {
      id: 'barter',
      name: 'Barter Exchange',
      type: 'barter',
      icon: <Handshake className="w-5 h-5" />,
      description: 'Exchange goods or services',
      ranking: 5,
      processingTime: 'By agreement',
      fees: 'Free'
    }
  ]);

  // Filter methods based on order amount (Cash on Delivery not available for high value)
  const availableMethods = methods.filter(method => {
    if (method.type === 'cash' && orderTotal > (method.maxAmount || 0)) {
      return false;
    }
    return true;
  });

  // Sort by ranking (lowest number = highest priority)
  const sortedMethods = availableMethods.sort((a, b) => a.ranking - b.ranking);

  const handleSelectMethod = (method: PaymentMethod) => {
    onSelectMethod(method);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg">Payment Method</h3>
        <Badge variant="secondary" className="text-xs">
          Recommended options shown first
        </Badge>
      </div>

      <div className="space-y-3">
        {sortedMethods.map((method, index) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedMethod === method.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleSelectMethod(method)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    method.type === 'escrow' ? 'bg-green-100 text-green-600' :
                    method.type === 'online' ? 'bg-blue-100 text-blue-600' :
                    method.type === 'cash' ? 'bg-orange-100 text-orange-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {method.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{method.name}</span>
                      {method.recommended && (
                        <Badge variant="default" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs">
                          Pre-selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {method.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>Processing: {method.processingTime}</span>
                      <span>Fees: {method.fees}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedMethod === method.id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orderTotal > 1000 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm text-orange-800">
            <strong>Note:</strong> Cash on Delivery is not available for orders above £1,000. 
            Please choose an alternative payment method for high-value transactions.
          </p>
        </div>
      )}
    </div>
  );
}