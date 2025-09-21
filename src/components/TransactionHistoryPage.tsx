import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowLeft, Search, Download, Filter, Calendar, 
  CreditCard, Truck, Shield, Handshake, Package,
  CheckCircle, Clock, AlertCircle, X, Eye
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'cash' | 'online' | 'escrow' | 'barter';
  method: string;
  amount?: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled' | 'disputed';
  date: string;
  description: string;
  orderId: string;
  seller?: string;
  buyer?: string;
  items: string[];
  barterOffer?: {
    offered: string;
    received: string;
  };
}

interface TransactionHistoryPageProps {
  onNavigate: (page: string) => void;
}

export function TransactionHistoryPage({ onNavigate }: TransactionHistoryPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const transactionsPerPage = 20;

  // Simulate loading transaction data
  useEffect(() => {
    const loadTransactions = () => {
      // Mock transaction data
      const mockTransactions: Transaction[] = [
        {
          id: 'TXN1701234567',
          type: 'escrow',
          method: 'Escrow Payment',
          amount: 129.99,
          status: 'completed',
          date: '2024-01-15T10:30:00Z',
          description: 'iPhone 12 Pro Max - 256GB',
          orderId: 'ORD001',
          seller: 'TechStore London',
          items: ['iPhone 12 Pro Max - 256GB', 'Phone Case']
        },
        {
          id: 'TXN1701234566',
          type: 'cash',
          method: 'Cash on Delivery',
          amount: 45.50,
          status: 'completed',
          date: '2024-01-14T15:45:00Z',
          description: 'African Print Dress - Size M',
          orderId: 'ORD002',
          seller: 'Ankara Fashions',
          items: ['African Print Dress - Size M']
        },
        {
          id: 'TXN1701234565',
          type: 'online',
          method: 'Card Payment',
          amount: 89.99,
          status: 'completed',
          date: '2024-01-13T09:20:00Z',
          description: 'Cooking Masterclass Bundle',
          orderId: 'ORD003',
          seller: 'Chef Academy',
          items: ['West African Cooking Course', 'Recipe eBook']
        },
        {
          id: 'BP1701234564',
          type: 'barter',
          method: 'Barter Exchange',
          status: 'pending',
          date: '2024-01-12T14:15:00Z',
          description: 'Laptop for Graphics Tablet Exchange',
          orderId: 'BARTER001',
          seller: 'DigitalArtist',
          buyer: 'TechWriter',
          items: ['MacBook Pro 13"'],
          barterOffer: {
            offered: 'MacBook Pro 13" (2020)',
            received: 'Wacom Cintiq Pro 16'
          }
        },
        {
          id: 'TXN1701234563',
          type: 'escrow',
          method: 'Escrow Payment',
          amount: 250.00,
          status: 'disputed',
          date: '2024-01-11T11:10:00Z',
          description: 'Professional Camera Lens',
          orderId: 'ORD004',
          seller: 'PhotoGear UK',
          items: ['Canon EF 50mm f/1.8 STM Lens']
        },
        {
          id: 'TXN1701234562',
          type: 'online',
          method: 'PayPal',
          amount: 75.25,
          status: 'failed',
          date: '2024-01-10T16:30:00Z',
          description: 'Handwoven Basket Set',
          orderId: 'ORD005',
          seller: 'African Crafts Co',
          items: ['Handwoven Basket Set (3 pieces)']
        }
      ];

      setTimeout(() => {
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
        setIsLoading(false);
      }, 1000);
    };

    loadTransactions();
  }, []);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.seller?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'failed':
      case 'disputed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <Truck className="w-4 h-4" />;
      case 'online':
        return <CreditCard className="w-4 h-4" />;
      case 'escrow':
        return <Shield className="w-4 h-4" />;
      case 'barter':
        return <Handshake className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'failed':
      case 'disputed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    
    // Simulate export generation
    setTimeout(() => {
      const filename = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'csv') {
        const csvContent = [
          ['Transaction ID', 'Type', 'Method', 'Amount', 'Status', 'Date', 'Description'],
          ...filteredTransactions.map(t => [
            t.id,
            t.type,
            t.method,
            t.amount ? `£${t.amount}` : 'N/A',
            t.status,
            new Date(t.date).toLocaleDateString(),
            t.description
          ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      } else {
        // Simulate PDF download
        alert(`PDF export would be downloaded as ${filename}`);
      }
      
      setIsExporting(false);
    }, 2000);
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );

  if (selectedTransaction) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTransaction(null)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to History</span>
              </Button>
              <h1 className="text-xl font-semibold">Transaction Details</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getTypeIcon(selectedTransaction.type)}
                  <span>{selectedTransaction.method}</span>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono">{selectedTransaction.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p>{new Date(selectedTransaction.date).toLocaleString()}</p>
                  </div>
                  {selectedTransaction.amount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-semibold">£{selectedTransaction.amount.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <ul className="space-y-1">
                    {selectedTransaction.items.map((item, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedTransaction.barterOffer && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Barter Exchange</p>
                    <div className="space-y-2">
                      <p><strong>Offered:</strong> {selectedTransaction.barterOffer.offered}</p>
                      <p><strong>Received:</strong> {selectedTransaction.barterOffer.received}</p>
                    </div>
                  </div>
                )}

                {selectedTransaction.seller && (
                  <div>
                    <p className="text-sm text-muted-foreground">Seller</p>
                    <p>{selectedTransaction.seller}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
              onClick={() => onNavigate('profile')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </Button>
            <h1 className="text-xl font-semibold">Transaction History</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cash">Cash on Delivery</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                  <SelectItem value="escrow">Escrow</SelectItem>
                  <SelectItem value="barter">Barter</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'CSV'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
          </p>
          {filteredTransactions.length > transactionsPerPage && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading transactions...</p>
            </CardContent>
          </Card>
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {transactions.length === 0 
                  ? "You haven't made any transactions yet."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {paginatedTransactions.map((transaction) => (
              <Card 
                key={transaction.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(transaction.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium">{transaction.description}</p>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{transaction.id}</span>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <span>{transaction.method}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {transaction.amount ? (
                        <p className="font-semibold">£{transaction.amount.toFixed(2)}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Barter Exchange</p>
                      )}
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        {getStatusIcon(transaction.status)}
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Export Notice */}
        <Alert className="mt-6">
          <Download className="h-4 w-4" />
          <AlertDescription>
            Export up to 12 months of transaction history in CSV or PDF format. 
            All exports include transaction details, payment methods, and status information.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}