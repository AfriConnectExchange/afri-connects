import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Package, TrendingUp, Mail, Settings, Check, X, Trash2, Filter, Search, ShoppingCart, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { CustomAlert } from './ui/custom-alert';
import { CustomModal } from './ui/custom-modal';
import { AnimatedButton } from './ui/animated-button';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon: React.ComponentType<{ className?: string }>;
  priority: 'high' | 'medium' | 'low';
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Confirmed',
    message: 'Your order #AC12345 has been confirmed by the seller. Estimated delivery: 3-5 business days.',
    timestamp: '2024-01-20T10:30:00Z',
    read: false,
    icon: Package,
    priority: 'high',
    action: {
      label: 'Track Order',
      onClick: () => console.log('Track order')
    }
  },
  {
    id: '2',
    type: 'delivery',
    title: 'Package Delivered',
    message: 'Your order #AC12344 has been successfully delivered to your address. Please confirm receipt.',
    timestamp: '2024-01-20T09:15:00Z',
    read: false,
    icon: CheckCircle,
    priority: 'high',
    action: {
      label: 'Confirm Receipt',
      onClick: () => console.log('Confirm receipt')
    }
  },
  {
    id: '3',
    type: 'promotion',
    title: 'Special Offer: 20% Off African Textiles',
    message: 'Limited time offer on premium African fabrics and textiles. Valid until January 31st.',
    timestamp: '2024-01-20T08:00:00Z',
    read: true,
    icon: TrendingUp,
    priority: 'medium',
    action: {
      label: 'Shop Now',
      onClick: () => console.log('Shop now')
    }
  },
  {
    id: '4',
    type: 'order',
    title: 'Payment Required',
    message: 'Your order #AC12346 is waiting for payment. Complete payment to proceed with shipping.',
    timestamp: '2024-01-19T16:45:00Z',
    read: true,
    icon: AlertCircle,
    priority: 'high',
    action: {
      label: 'Pay Now',
      onClick: () => console.log('Pay now')
    }
  },
  {
    id: '5',
    type: 'system',
    title: 'Profile Verification Complete',
    message: 'Your seller profile has been verified. You can now list products and accept orders.',
    timestamp: '2024-01-19T14:20:00Z',
    read: true,
    icon: User,
    priority: 'medium'
  },
  {
    id: '6',
    type: 'delivery',
    title: 'Delivery Attempted',
    message: 'Delivery attempt failed for order #AC12343. The package will be redelivered tomorrow.',
    timestamp: '2024-01-19T11:30:00Z',
    read: true,
    icon: Package,
    priority: 'medium',
    action: {
      label: 'Reschedule',
      onClick: () => console.log('Reschedule delivery')
    }
  }
];

const notificationTypes = ['all', 'order', 'delivery', 'promotion', 'system'];

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    inApp: true,
    email: true,
    sms: false,
    orderUpdates: true,
    deliveryAlerts: true,
    promotions: true,
    systemAlerts: true
  });
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

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertState({ isOpen: true, type, title, message });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || notification.type === activeTab;
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    showAlert('success', 'All Read', 'All notifications have been marked as read.');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showAlert('success', 'Deleted', 'Notification has been deleted.');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showAlert('success', 'Cleared', 'All notifications have been cleared.');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivery': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'promotion': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'system': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-amber-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Bell className="w-8 h-8 text-primary" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs min-w-[20px] h-5">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                <p className="text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              {unreadCount > 0 && (
                <AnimatedButton
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark All Read
                </AnimatedButton>
              )}
              <AnimatedButton
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="sm"
              >
                <Settings className="w-4 h-4" />
              </AnimatedButton>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full max-w-2xl mb-6">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="order">
                Orders ({notifications.filter(n => n.type === 'order').length})
              </TabsTrigger>
              <TabsTrigger value="delivery">
                Delivery ({notifications.filter(n => n.type === 'delivery').length})
              </TabsTrigger>
              <TabsTrigger value="promotion">
                Offers ({notifications.filter(n => n.type === 'promotion').length})
              </TabsTrigger>
              <TabsTrigger value="system">
                System ({notifications.filter(n => n.type === 'system').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <AnimatePresence>
                {filteredNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? "No notifications match your search." 
                        : "You're all caught up! No new notifications."
                      }
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification, index) => {
                      const Icon = notification.icon;
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className={`hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                              !notification.read ? 'bg-blue-50/30 border-blue-200' : ''
                            }`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                  notification.type === 'order' ? 'bg-blue-100' :
                                  notification.type === 'delivery' ? 'bg-emerald-100' :
                                  notification.type === 'promotion' ? 'bg-purple-100' :
                                  'bg-gray-100'
                                }`}>
                                  <Icon className={`w-5 h-5 ${
                                    notification.type === 'order' ? 'text-blue-600' :
                                    notification.type === 'delivery' ? 'text-emerald-600' :
                                    notification.type === 'promotion' ? 'text-purple-600' :
                                    'text-gray-600'
                                  }`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className={`font-semibold text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {notification.title}
                                      </h3>
                                      <Badge variant="outline" className={`text-xs ${getTypeColor(notification.type)}`}>
                                        {notification.type}
                                      </Badge>
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatTimestamp(notification.timestamp)}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteNotification(notification.id);
                                        }}
                                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                    {notification.message}
                                  </p>

                                  {notification.action && (
                                    <AnimatedButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        notification.action!.onClick();
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="h-8"
                                    >
                                      {notification.action.label}
                                    </AnimatedButton>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <CustomModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Notification Settings"
        description="Configure how and when you receive notifications"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Delivery Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="inApp" className="font-medium">In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications within the app</p>
                </div>
                <Switch
                  id="inApp"
                  checked={notificationSettings.inApp}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, inApp: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email" className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email"
                  checked={notificationSettings.email}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, email: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms" className="font-medium">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive important updates via SMS</p>
                </div>
                <Switch
                  id="sms"
                  checked={notificationSettings.sms}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, sms: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Notification Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="orderUpdates" className="font-medium">Order Updates</Label>
                  <p className="text-sm text-muted-foreground">Order confirmations, shipping updates</p>
                </div>
                <Switch
                  id="orderUpdates"
                  checked={notificationSettings.orderUpdates}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, orderUpdates: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="deliveryAlerts" className="font-medium">Delivery Alerts</Label>
                  <p className="text-sm text-muted-foreground">Delivery attempts, confirmations</p>
                </div>
                <Switch
                  id="deliveryAlerts"
                  checked={notificationSettings.deliveryAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, deliveryAlerts: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="promotions" className="font-medium">Promotional Offers</Label>
                  <p className="text-sm text-muted-foreground">Special offers, discounts, campaigns</p>
                </div>
                <Switch
                  id="promotions"
                  checked={notificationSettings.promotions}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, promotions: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemAlerts" className="font-medium">System Alerts</Label>
                  <p className="text-sm text-muted-foreground">Account updates, security alerts</p>
                </div>
                <Switch
                  id="systemAlerts"
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <AnimatedButton
              onClick={() => {
                showAlert('success', 'Settings Saved', 'Your notification preferences have been updated.');
                setShowSettings(false);
              }}
              className="flex-1"
            >
              Save Settings
            </AnimatedButton>
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        autoClose={alertState.type === 'success'}
      />
    </div>
  );
}