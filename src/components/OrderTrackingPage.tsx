import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Package, Truck, MapPin, Clock, CheckCircle, 
  AlertCircle, RefreshCw, Eye, Calendar, Phone, MessageSquare,
  Navigation, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CustomAlert } from './ui/custom-alert';
import { AnimatedButton } from './ui/animated-button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OrderTrackingPageProps {
  onNavigate: (page: string) => void;
}

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
}

interface OrderDetails {
  id: string;
  trackingNumber: string;
  status: 'processing' | 'shipped' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'failed';
  courierName: string;
  courierLogo: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  items: Array<{
    id: number;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    postcode: string;
    phone: string;
  };
  events: TrackingEvent[];
  courierContact?: {
    phone: string;
    website: string;
  };
}

// Mock order data
const mockOrders: OrderDetails[] = [
  {
    id: 'ORD-2024-001',
    trackingNumber: 'TRK1234567890UK',
    status: 'out-for-delivery',
    courierName: 'Royal Mail',
    courierLogo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=100',
    estimatedDelivery: '2024-01-25 16:00',
    items: [
      {
        id: 1,
        name: 'Traditional Kente Cloth',
        image: 'https://images.unsplash.com/photo-1692689383138-c2df3476072c?w=100',
        quantity: 1,
        price: 125
      }
    ],
    shippingAddress: {
      name: 'John Smith',
      street: '123 Example Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      phone: '+44 7700 900123'
    },
    events: [
      {
        id: '1',
        status: 'Order Placed',
        description: 'Order received and being processed',
        location: 'London, UK',
        timestamp: '2024-01-20 10:30',
        isCompleted: true
      },
      {
        id: '2',
        status: 'Processing',
        description: 'Item picked and packed at warehouse',
        location: 'Accra, Ghana',
        timestamp: '2024-01-21 14:45',
        isCompleted: true
      },
      {
        id: '3',
        status: 'Shipped',
        description: 'Package dispatched from origin',
        location: 'Accra International Airport',
        timestamp: '2024-01-22 08:15',
        isCompleted: true
      },
      {
        id: '4',
        status: 'In Transit',
        description: 'Package in transit to destination country',
        location: 'Heathrow Airport, London',
        timestamp: '2024-01-23 16:20',
        isCompleted: true
      },
      {
        id: '5',
        status: 'Out for Delivery',
        description: 'Package out for delivery with courier',
        location: 'London Delivery Hub',
        timestamp: '2024-01-25 09:30',
        isCompleted: true
      },
      {
        id: '6',
        status: 'Delivered',
        description: 'Package delivered successfully',
        location: 'London, SW1A 1AA',
        timestamp: '',
        isCompleted: false
      }
    ],
    courierContact: {
      phone: '+44 345 774 0740',
      website: 'https://www.royalmail.com'
    }
  },
  {
    id: 'ORD-2024-002',
    trackingNumber: 'DHL9876543210UK',
    status: 'delivered',
    courierName: 'DHL Express',
    courierLogo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=100',
    estimatedDelivery: '2024-01-20 14:00',
    actualDelivery: '2024-01-20 13:45',
    items: [
      {
        id: 2,
        name: 'African Print Dress',
        image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=100',
        quantity: 2,
        price: 42
      }
    ],
    shippingAddress: {
      name: 'Sarah Johnson',
      street: '456 High Street',
      city: 'Manchester',
      postcode: 'M1 1AA',
      phone: '+44 7700 900456'
    },
    events: [
      {
        id: '1',
        status: 'Order Placed',
        description: 'Order received and being processed',
        location: 'Manchester, UK',
        timestamp: '2024-01-18 11:20',
        isCompleted: true
      },
      {
        id: '2',
        status: 'Shipped',
        description: 'Package dispatched from origin',
        location: 'Nairobi, Kenya',
        timestamp: '2024-01-19 10:00',
        isCompleted: true
      },
      {
        id: '3',
        status: 'Delivered',
        description: 'Package delivered successfully',
        location: 'Manchester, M1 1AA',
        timestamp: '2024-01-20 13:45',
        isCompleted: true
      }
    ],
    courierContact: {
      phone: '+44 345 100 0800',
      website: 'https://www.dhl.co.uk'
    }
  }
];

export function OrderTrackingPage({ onNavigate }: OrderTrackingPageProps) {
  const [trackingInput, setTrackingInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedOrder) {
        handleRefreshTracking();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [selectedOrder]);

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertState({ isOpen: true, type, title, message });
  };

  const handleTrackOrder = () => {
    if (!trackingInput.trim()) {
      showAlert('error', 'Invalid Input', 'Please enter a tracking number');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const order = mockOrders.find(o => 
        o.trackingNumber.toLowerCase().includes(trackingInput.toLowerCase()) ||
        o.id.toLowerCase().includes(trackingInput.toLowerCase())
      );

      if (order) {
        setSelectedOrder(order);
        showAlert('success', 'Order Found', 'Tracking information loaded successfully');
      } else {
        showAlert('error', 'Order Not Found', 'Tracking information not available. Please check your tracking number.');
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleRefreshTracking = () => {
    if (!selectedOrder) return;
    
    setIsLoading(true);
    setLastRefresh(new Date());
    
    // Simulate API refresh
    setTimeout(() => {
      showAlert('info', 'Tracking Updated', 'Latest tracking information retrieved');
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'out-for-delivery': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-transit': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'processing': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'processing': return 20;
      case 'shipped': return 40;
      case 'in-transit': return 60;
      case 'out-for-delivery': return 80;
      case 'delivered': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="font-bold text-foreground">Order Tracking</h1>
              <p className="text-muted-foreground">Track your orders in real-time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tracking Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Track Your Order
                </CardTitle>
                <CardDescription>
                  Enter your order ID or tracking number to get real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="tracking" className="sr-only">
                      Tracking Number
                    </Label>
                    <Input
                      id="tracking"
                      placeholder="Enter tracking number or order ID (e.g., TRK1234567890UK)"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                    />
                  </div>
                  <AnimatedButton
                    onClick={handleTrackOrder}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    Track Order
                  </AnimatedButton>
                </div>
                
                {/* Sample tracking numbers */}
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Try these sample tracking numbers:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTrackingInput('TRK1234567890UK')}
                      className="text-xs"
                    >
                      TRK1234567890UK
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTrackingInput('ORD-2024-002')}
                      className="text-xs"
                    >
                      ORD-2024-002
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          {!selectedOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your recent orders that can be tracked</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {order.courierName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {order.status.replace('-', ' ')}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.trackingNumber}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Order Details */}
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-semibold">{selectedOrder.id}</h2>
                      <p className="text-sm text-muted-foreground">
                        Tracking: {selectedOrder.trackingNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.replace('-', ' ')}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshTracking}
                        disabled={isLoading}
                        className="gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Delivery Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {getProgressPercentage(selectedOrder.status)}%
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(selectedOrder.status)} className="h-2" />
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedOrder.actualDelivery 
                          ? `Delivered: ${formatDateTime(selectedOrder.actualDelivery)}`
                          : `Estimated: ${formatDateTime(selectedOrder.estimatedDelivery)}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.courierName}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>

              <Tabs defaultValue="tracking" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tracking">Tracking Events</TabsTrigger>
                  <TabsTrigger value="items">Order Items</TabsTrigger>
                  <TabsTrigger value="contact">Contact & Help</TabsTrigger>
                </TabsList>

                <TabsContent value="tracking" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="w-5 h-5" />
                        Tracking Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedOrder.events.map((event, index) => (
                          <div key={event.id} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full border-2 ${
                                event.isCompleted 
                                  ? 'bg-primary border-primary' 
                                  : 'bg-background border-muted-foreground'
                              }`} />
                              {index < selectedOrder.events.length - 1 && (
                                <div className={`w-0.5 h-12 ${
                                  event.isCompleted ? 'bg-primary' : 'bg-muted'
                                }`} />
                              )}
                            </div>
                            <div className="flex-1 pb-8">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium ${
                                  event.isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {event.status}
                                </h4>
                                {event.isCompleted && (
                                  <CheckCircle className="w-4 h-4 text-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </div>
                                {event.timestamp && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDateTime(event.timestamp)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">£{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-6" />

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-medium mb-3">Shipping Address</h4>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.shippingAddress.street}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postcode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.shippingAddress.phone}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact & Support</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Courier Contact */}
                      {selectedOrder.courierContact && (
                        <div>
                          <h4 className="font-medium mb-3">Courier Information</h4>
                          <div className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{selectedOrder.courierName}</span>
                              <Badge variant="outline">Official Courier</Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => window.open(`tel:${selectedOrder.courierContact?.phone}`)}
                              >
                                <Phone className="w-4 h-4" />
                                {selectedOrder.courierContact.phone}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => window.open(selectedOrder.courierContact?.website, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Visit Website
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AfriConnect Support */}
                      <div>
                        <h4 className="font-medium mb-3">AfriConnect Support</h4>
                        <div className="space-y-3">
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              If you have issues with your order, our support team is here to help.
                            </AlertDescription>
                          </Alert>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => onNavigate('support')}
                            >
                              <MessageSquare className="w-4 h-4" />
                              Contact Support
                            </Button>
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => onNavigate('help')}
                            >
                              <ExternalLink className="w-4 h-4" />
                              Help Center
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedOrder(null)}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Track Another Order
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('transactions')}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View All Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        autoClose={alertState.type === 'success' || alertState.type === 'info'}
      />
    </div>
  );
}