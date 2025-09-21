import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Send, History, Plus, Search, Filter, MapPin, Clock, CheckCircle, 
  AlertCircle, Eye, Download, CreditCard, Wallet, Smartphone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { AnimatedButton } from './ui/animated-button';
import { CustomModal } from './ui/custom-modal';
import { CustomAlert } from './ui/custom-alert';

interface RemittancePageProps {
  onNavigate: (page: string) => void;
}

// Mock data for demonstration
const mockTransfers = [
  {
    id: 'AC-REM-001',
    recipient: 'John Doe',
    amount: 250,
    currency: 'GBP',
    recipientCountry: 'Nigeria',
    status: 'delivered',
    date: '2024-01-20',
    deliveryTime: '2024-01-20 14:30',
    method: 'card',
    fees: 5.99
  },
  {
    id: 'AC-REM-002',
    recipient: 'Sarah Johnson',
    amount: 150,
    currency: 'GBP',
    recipientCountry: 'Kenya',
    status: 'pending',
    date: '2024-01-19',
    deliveryTime: null,
    method: 'wallet',
    fees: 3.99
  },
  {
    id: 'AC-REM-003',
    recipient: 'Michael Brown',
    amount: 500,
    currency: 'GBP',
    recipientCountry: 'Ghana',
    status: 'failed',
    date: '2024-01-18',
    deliveryTime: null,
    method: 'paypal',
    fees: 12.50
  }
];

const countries = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' }
];

const purposes = [
  'Family Support',
  'Education',
  'Medical Expenses',
  'Business Investment',
  'Emergency Aid',
  'Other'
];

const paymentMethods = [
  { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, fee: '2.9%' },
  { id: 'wallet', name: 'Digital Wallet', icon: Wallet, fee: '1.9%' },
  { id: 'paypal', name: 'PayPal', icon: Smartphone, fee: '3.4%' }
];

export function RemittancePage({ onNavigate }: RemittancePageProps) {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showTransferDetails, setShowTransferDetails] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Send Money Form State
  const [sendForm, setSendForm] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientCountry: '',
    amount: '',
    purpose: '',
    paymentMethod: 'card',
    notes: ''
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

  const handleSendMoney = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    showAlert('success', 'Transfer Initiated!', 'Your money transfer has been queued for processing. The recipient will be notified once delivered.');
    setShowSendModal(false);
    setSendForm({
      recipientName: '',
      recipientPhone: '',
      recipientCountry: '',
      amount: '',
      purpose: '',
      paymentMethod: 'card',
      notes: ''
    });
    setIsProcessing(false);
  };

  const calculateFees = (amount: number, method: string) => {
    const methodData = paymentMethods.find(m => m.id === method);
    if (!methodData) return 0;
    
    const feeRate = parseFloat(methodData.fee.replace('%', '')) / 100;
    return Math.max(amount * feeRate, 2.99); // Minimum fee of £2.99
  };

  const filteredTransfers = mockTransfers.filter(transfer => {
    const matchesSearch = transfer.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transfer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-white text-primary border-border';
      case 'pending': return 'bg-white text-primary border-border';
      case 'failed': return 'bg-white text-primary border-border';
      default: return 'bg-white text-primary border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Money Transfer</h1>
              <p className="text-muted-foreground">Send money securely across Africa</p>
            </div>
            
            <AnimatedButton
              onClick={() => setShowSendModal(true)}
              className="gap-2"
              animationType="glow"
            >
              <Send className="w-4 h-4" />
              Send Money
            </AnimatedButton>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'send' | 'history')}>
            <TabsList className="grid w-fit grid-cols-2 mb-8">
              <TabsTrigger value="send">Send Money</TabsTrigger>
              <TabsTrigger value="history">Transfer History</TabsTrigger>
            </TabsList>

            <TabsContent value="send">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-white border border-border">
                  <CardHeader className="text-center">
                    <CardTitle>Quick Send</CardTitle>
                    <CardDescription>Send money to family and friends across Africa</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quick Send Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Recipient Name</Label>
                        <Input placeholder="Enter recipient's name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input placeholder="+234 800 000 0000" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.flag} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (GBP)</Label>
                        <Input placeholder="0.00" type="number" min="10" max="1000" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Purpose</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          {purposes.map(purpose => (
                            <SelectItem key={purpose} value={purpose.toLowerCase().replace(' ', '-')}>
                              {purpose}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h4 className="font-medium text-foreground mb-3">Transfer Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="text-foreground">£0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transfer Fee</span>
                          <span className="text-foreground">£0.00</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span className="text-foreground">Total</span>
                          <span className="text-foreground">£0.00</span>
                        </div>
                      </div>
                    </div>

                    <AnimatedButton 
                      className="w-full" 
                      disabled
                    >
                      Continue to Payment
                    </AnimatedButton>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transfers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transfer List */}
                {filteredTransfers.length === 0 ? (
                  <Card className="bg-white border border-border">
                    <CardContent className="text-center py-12">
                      <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No transfers yet</h3>
                      <p className="text-muted-foreground mb-4">Start by sending money to family and friends</p>
                      <AnimatedButton onClick={() => setActiveTab('send')}>
                        Send Your First Transfer
                      </AnimatedButton>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredTransfers.map((transfer, index) => {
                      const StatusIcon = getStatusIcon(transfer.status);
                      const country = countries.find(c => c.name.toLowerCase() === transfer.recipientCountry.toLowerCase());
                      
                      return (
                        <motion.div
                          key={transfer.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-white border border-border hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center">
                                    <StatusIcon className="w-6 h-6 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-foreground">{transfer.recipient}</h3>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                      <span>{country?.flag} {transfer.recipientCountry}</span>
                                      <span>•</span>
                                      <span>{transfer.id}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="font-semibold text-foreground">£{transfer.amount}</p>
                                  <Badge variant="outline" className={getStatusColor(transfer.status)}>
                                    {transfer.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                  {transfer.status === 'delivered' && transfer.deliveryTime
                                    ? `Delivered on ${new Date(transfer.deliveryTime).toLocaleString()}`
                                    : `Sent on ${new Date(transfer.date).toLocaleDateString()}`
                                  }
                                </p>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setShowTransferDetails(transfer.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Send Money Modal */}
      <CustomModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Money"
        description="Complete the transfer details and select payment method"
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-muted/20 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Demo Mode</h4>
            <p className="text-sm text-muted-foreground">
              This is a demonstration of the money transfer flow. In the full version, actual payment processing and delivery would occur.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <AnimatedButton
              onClick={handleSendMoney}
              isLoading={isProcessing}
              loadingText="Processing..."
              className="flex-1"
            >
              Send Transfer
            </AnimatedButton>
            <Button
              variant="outline"
              onClick={() => setShowSendModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* Transfer Details Modal */}
      <CustomModal
        isOpen={!!showTransferDetails}
        onClose={() => setShowTransferDetails(null)}
        title="Transfer Details"
        description="Complete information about your money transfer"
        size="md"
      >
        {showTransferDetails && (
          <div className="space-y-4">
            {(() => {
              const transfer = mockTransfers.find(t => t.id === showTransferDetails);
              if (!transfer) return null;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Transaction ID</p>
                      <p className="font-medium text-foreground">{transfer.id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium text-foreground">£{transfer.amount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fees</p>
                      <p className="font-medium text-foreground">£{transfer.fees}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant="outline" className={getStatusColor(transfer.status)}>
                        {transfer.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Download Receipt
                  </Button>
                </div>
              );
            })()}
          </div>
        )}
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