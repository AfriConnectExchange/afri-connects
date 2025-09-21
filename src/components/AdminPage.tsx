import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Users, AlertTriangle, Ban, CheckCircle, Search, Filter,
  MoreHorizontal, Eye, Clock, DollarSign, FileText, MessageSquare,
  UserX, UserCheck, Gavel, Lock, Unlock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AnimatedButton } from './ui/animated-button';
import { CustomModal } from './ui/custom-modal';
import { CustomAlert } from './ui/custom-alert';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

// Mock data for demonstration
const mockUsers = [
  {
    id: 'user-001',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'seller',
    status: 'active',
    joinDate: '2024-01-15',
    lastActive: '2024-01-20',
    totalOrders: 45,
    totalSales: 12400,
    verificationStatus: 'verified',
    riskLevel: 'low'
  },
  {
    id: 'user-002',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    role: 'buyer',
    status: 'suspended',
    joinDate: '2024-01-10',
    lastActive: '2024-01-18',
    totalOrders: 12,
    totalSales: 0,
    verificationStatus: 'pending',
    riskLevel: 'medium'
  },
  {
    id: 'user-003',
    name: 'Emma Williams',
    email: 'emma.w@example.com',
    role: 'sme',
    status: 'active',
    joinDate: '2024-01-05',
    lastActive: '2024-01-20',
    totalOrders: 89,
    totalSales: 34500,
    verificationStatus: 'verified',
    riskLevel: 'low'
  }
];

const mockDisputes = [
  {
    id: 'disp-001',
    type: 'escrow',
    orderId: 'AC-ORD-001',
    buyer: 'John Smith',
    seller: 'African Arts Co.',
    amount: 250,
    reason: 'Product not as described',
    status: 'open',
    createdDate: '2024-01-18',
    evidence: ['Photo of received item', 'Original product listing'],
    description: 'The textile received does not match the quality shown in the listing photos.'
  },
  {
    id: 'disp-002',
    type: 'barter',
    orderId: 'AC-BAR-001',
    buyer: 'Lisa Brown',
    seller: 'Craft Masters Ltd.',
    amount: 0,
    reason: 'Item condition mismatch',
    status: 'in-review',
    createdDate: '2024-01-17',
    evidence: ['Condition assessment', 'Trade agreement'],
    description: 'The bartered item was in worse condition than agreed upon.'
  }
];

const mockAuditLogs = [
  {
    id: 'log-001',
    adminId: 'admin-001',
    adminName: 'Admin User',
    action: 'User Suspension',
    targetId: 'user-002',
    targetName: 'Michael Chen',
    timestamp: '2024-01-20 14:30:00',
    reason: 'Multiple policy violations',
    details: 'Suspended for 30 days due to fraudulent activity reports'
  },
  {
    id: 'log-002',
    adminId: 'admin-001',
    adminName: 'Admin User',
    action: 'Dispute Resolution',
    targetId: 'disp-001',
    targetName: 'Order AC-ORD-001',
    timestamp: '2024-01-20 13:15:00',
    reason: 'Evidence review completed',
    details: 'Resolved in favor of buyer, escrow funds released'
  }
];

export function AdminPage({ onNavigate }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'disputes' | 'logs'>('users');
  const [showUserModal, setShowUserModal] = useState<string | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState<string | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [suspensionForm, setSuspensionForm] = useState({
    reason: '',
    duration: '7',
    notes: ''
  });

  const [disputeResolution, setDisputeResolution] = useState({
    decision: '',
    notes: '',
    favorParty: ''
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

  const handleSuspendUser = async () => {
    if (!suspensionForm.reason) {
      showAlert('error', 'Missing Information', 'Please provide a reason for suspension.');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    showAlert('success', 'User Suspended', 'The user account has been suspended and logged for audit.');
    setShowSuspendModal(null);
    setSuspensionForm({ reason: '', duration: '7', notes: '' });
    setIsProcessing(false);
  };

  const handleResolveDispute = async () => {
    if (!disputeResolution.decision || !disputeResolution.favorParty) {
      showAlert('error', 'Incomplete Resolution', 'Please provide a decision and select which party to favor.');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showAlert('success', 'Dispute Resolved', 'The dispute has been resolved and all parties have been notified.');
    setShowDisputeModal(null);
    setDisputeResolution({ decision: '', notes: '', favorParty: '' });
    setIsProcessing(false);
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string, type: 'user' | 'dispute' = 'user') => {
    if (type === 'user') {
      switch (status) {
        case 'active': return 'bg-white text-primary border-border';
        case 'suspended': return 'bg-white text-primary border-border';
        case 'deactivated': return 'bg-white text-primary border-border';
        default: return 'bg-white text-primary border-border';
      }
    } else {
      switch (status) {
        case 'open': return 'bg-white text-primary border-border';
        case 'in-review': return 'bg-white text-primary border-border';
        case 'resolved': return 'bg-white text-primary border-border';
        default: return 'bg-white text-primary border-border';
      }
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-white text-primary border-border';
      case 'medium': return 'bg-white text-primary border-border';
      case 'high': return 'bg-white text-primary border-border';
      default: return 'bg-white text-primary border-border';
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
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Admin Panel</h1>
                <p className="text-muted-foreground">Manage platform users and resolve disputes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <span>Last login: Today, 2:30 PM</span>
              <Badge variant="outline" className="bg-white text-primary border-border">
                Super Admin
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white border border-border">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">1,247</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-border">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">8</p>
                <p className="text-sm text-muted-foreground">Open Disputes</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-border">
              <CardContent className="p-4 text-center">
                <Ban className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">23</p>
                <p className="text-sm text-muted-foreground">Suspended Users</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-border">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">156</p>
                <p className="text-sm text-muted-foreground">Resolved This Month</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-fit grid-cols-3 mb-8">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="disputes">Dispute Resolution</TabsTrigger>
              <TabsTrigger value="logs">Audit Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="deactivated">Deactivated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users List */}
                <div className="space-y-4">
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white border border-border hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium text-foreground">{user.name}</h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs bg-white text-primary border-border">
                                    {user.role}
                                  </Badge>
                                  <Badge variant="outline" className={`text-xs ${getStatusColor(user.status)}`}>
                                    {user.status}
                                  </Badge>
                                  <Badge variant="outline" className={`text-xs ${getRiskColor(user.riskLevel)}`}>
                                    {user.riskLevel} risk
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowUserModal(user.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {user.status === 'active' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setShowSuspendModal(user.id)}
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="block font-medium text-foreground">{user.totalOrders}</span>
                              <span>Total Orders</span>
                            </div>
                            <div>
                              <span className="block font-medium text-foreground">£{user.totalSales.toLocaleString()}</span>
                              <span>Total Sales</span>
                            </div>
                            <div>
                              <span className="block font-medium text-foreground">{new Date(user.joinDate).toLocaleDateString()}</span>
                              <span>Joined</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="disputes">
              <div className="space-y-4">
                {mockDisputes.map((dispute, index) => (
                  <motion.div
                    key={dispute.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white border border-border hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className={`${getStatusColor(dispute.status, 'dispute')}`}>
                                {dispute.status}
                              </Badge>
                              <Badge variant="outline" className="bg-white text-primary border-border">
                                {dispute.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">#{dispute.orderId}</span>
                            </div>
                            
                            <h3 className="font-medium text-foreground">{dispute.reason}</h3>
                            <p className="text-sm text-muted-foreground">{dispute.description}</p>
                            
                            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium text-foreground">Buyer:</span> {dispute.buyer}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">Seller:</span> {dispute.seller}
                              </div>
                              {dispute.amount > 0 && (
                                <div>
                                  <span className="font-medium text-foreground">Amount:</span> £{dispute.amount}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowDisputeModal(dispute.id)}
                            >
                              <Gavel className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <div className="space-y-4">
                {mockAuditLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white border border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="bg-white text-primary border-border">
                                {log.action}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                            </div>
                            
                            <p className="text-sm">
                              <span className="font-medium text-foreground">{log.adminName}</span>{' '}
                              performed <span className="font-medium text-foreground">{log.action}</span>{' '}
                              on <span className="font-medium text-foreground">{log.targetName}</span>
                            </p>
                            
                            <p className="text-sm text-muted-foreground">{log.details}</p>
                            
                            {log.reason && (
                              <p className="text-sm">
                                <span className="font-medium text-foreground">Reason:</span> {log.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* User Details Modal */}
      <CustomModal
        isOpen={!!showUserModal}
        onClose={() => setShowUserModal(null)}
        title="User Details"
        description="Complete information about the user account"
        size="lg"
      >
        {showUserModal && (
          <div className="space-y-4">
            {(() => {
              const user = mockUsers.find(u => u.id === showUserModal);
              if (!user) return null;
              
              return (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Demo Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      This is a demonstration of the admin user management interface. In the full version, complete user data and action history would be available.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium text-foreground">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <Badge variant="outline" className="bg-white text-primary border-border">
                        {user.role}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CustomModal>

      {/* Suspend User Modal */}
      <CustomModal
        isOpen={!!showSuspendModal}
        onClose={() => setShowSuspendModal(null)}
        title="Suspend User Account"
        description="Provide details for the suspension action"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <Label>Reason for Suspension</Label>
            <Select value={suspensionForm.reason} onValueChange={(value) => setSuspensionForm(prev => ({ ...prev, reason: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="policy-violation">Policy Violation</SelectItem>
                <SelectItem value="fraudulent-activity">Fraudulent Activity</SelectItem>
                <SelectItem value="spam-abuse">Spam/Abuse</SelectItem>
                <SelectItem value="payment-issues">Payment Issues</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Suspension Duration</Label>
            <Select value={suspensionForm.duration} onValueChange={(value) => setSuspensionForm(prev => ({ ...prev, duration: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Additional Notes</Label>
            <Textarea
              placeholder="Provide additional context for this action..."
              value={suspensionForm.notes}
              onChange={(e) => setSuspensionForm(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <AnimatedButton
              onClick={handleSuspendUser}
              isLoading={isProcessing}
              className="flex-1"
              variant="destructive"
            >
              Suspend Account
            </AnimatedButton>
            <Button
              variant="outline"
              onClick={() => setShowSuspendModal(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* Dispute Resolution Modal */}
      <CustomModal
        isOpen={!!showDisputeModal}
        onClose={() => setShowDisputeModal(null)}
        title="Resolve Dispute"
        description="Make a decision to resolve this dispute"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-muted/20 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Demo Mode</h4>
            <p className="text-sm text-muted-foreground">
              This demonstrates the dispute resolution workflow. In production, this would handle actual escrow releases and barter dispute resolutions.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <AnimatedButton
              onClick={handleResolveDispute}
              isLoading={isProcessing}
              className="flex-1"
            >
              Resolve Dispute
            </AnimatedButton>
            <Button
              variant="outline"
              onClick={() => setShowDisputeModal(null)}
              disabled={isProcessing}
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