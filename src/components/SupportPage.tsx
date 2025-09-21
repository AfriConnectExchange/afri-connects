import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, Bot, Phone, Mail, Send, Search, HelpCircle,
  Clock, CheckCircle, User, ArrowRight, FileText, Headphones
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

interface SupportPageProps {
  onNavigate: (page: string) => void;
}

// Mock data for demonstration
const mockTickets = [
  {
    id: 'TKT-001',
    subject: 'Payment Issue with Order AC-12345',
    category: 'billing',
    status: 'open',
    priority: 'high',
    createdDate: '2024-01-20',
    lastUpdate: '2024-01-20',
    description: 'Having trouble with payment processing for my recent order.'
  },
  {
    id: 'TKT-002',
    subject: 'Unable to Upload Product Images',
    category: 'technical',
    status: 'in-progress',
    priority: 'medium',
    createdDate: '2024-01-18',
    lastUpdate: '2024-01-19',
    description: 'The image upload feature is not working in my seller dashboard.'
  },
  {
    id: 'TKT-003',
    subject: 'Question About Seller Verification',
    category: 'general',
    status: 'resolved',
    priority: 'low',
    createdDate: '2024-01-15',
    lastUpdate: '2024-01-16',
    description: 'Need information about the seller verification process.'
  }
];

const mockFAQs = [
  {
    id: 'faq-001',
    question: 'How do I become a verified seller?',
    answer: 'To become a verified seller, you need to complete your profile, upload valid identification documents, and provide proof of address. The verification process typically takes 24-48 hours.',
    category: 'seller',
    helpful: 45
  },
  {
    id: 'faq-002',
    question: 'What payment methods are accepted?',
    answer: 'We accept major credit cards (Visa, Mastercard, American Express), PayPal, and digital wallets. All payments are processed securely through our encrypted payment system.',
    category: 'payment',
    helpful: 38
  },
  {
    id: 'faq-003',
    question: 'How does the escrow system work?',
    answer: 'Our escrow system holds buyer payments securely until the product is delivered and confirmed. This protects both buyers and sellers in every transaction.',
    category: 'general',
    helpful: 52
  },
  {
    id: 'faq-004',
    question: 'How can I track my order?',
    answer: 'You can track your order from your dashboard under "My Orders". You\'ll receive email notifications for major updates, and can see real-time status changes.',
    category: 'orders',
    helpful: 29
  }
];

const mockChatMessages = [
  {
    id: 'msg-001',
    sender: 'bot',
    message: 'Hello! I\'m here to help you. How can I assist you today?',
    timestamp: new Date().toISOString()
  }
];

const categories = [
  { value: 'general', label: 'General Question' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'account', label: 'Account & Profile' },
  { value: 'orders', label: 'Orders & Shipping' },
  { value: 'seller', label: 'Seller Support' }
];

const priorityLevels = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent' }
];

export function SupportPage({ onNavigate }: SupportPageProps) {
  const [activeTab, setActiveTab] = useState<'contact' | 'tickets' | 'chat' | 'faq'>('contact');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(mockChatMessages);
  const [chatInput, setChatInput] = useState('');
  
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
    email: '',
    name: ''
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

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.description || !ticketForm.category) {
      showAlert('error', 'Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (ticketForm.subject.length < 5) {
      showAlert('error', 'Invalid Subject', 'Subject must be at least 5 characters long.');
      return;
    }

    if (ticketForm.description.length < 20) {
      showAlert('error', 'Description Too Short', 'Please provide at least 20 characters describing your issue.');
      return;
    }

    // Simulate ticket submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const ticketId = `TKT-${String(Date.now()).slice(-3)}`;
    showAlert('success', 'Ticket Created!', `Your support ticket ${ticketId} has been created. We'll respond within 24 hours.`);
    
    setShowTicketModal(false);
    setTicketForm({
      subject: '',
      category: '',
      priority: 'medium',
      description: '',
      email: '',
      name: ''
    });
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      message: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        message: getBotResponse(chatInput),
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('payment') || lowerInput.includes('billing')) {
      return 'I can help with payment issues. We accept major credit cards, PayPal, and digital wallets. If you\'re experiencing payment problems, please check that your payment method is valid and has sufficient funds.';
    } else if (lowerInput.includes('order') || lowerInput.includes('track')) {
      return 'You can track your orders from your dashboard under "My Orders". If you need help finding a specific order, please provide your order number.';
    } else if (lowerInput.includes('seller') || lowerInput.includes('verification')) {
      return 'To become a verified seller, complete your profile and upload valid ID documents. The process takes 24-48 hours. Need help with a specific step?';
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return 'Hello! I\'m here to help you with any questions about AfriConnect. What can I assist you with today?';
    } else {
      return 'I understand you need help, but I might not have the perfect answer. Would you like me to connect you with a human agent, or would you prefer to create a support ticket for detailed assistance?';
    }
  };

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-white text-primary border-border';
      case 'in-progress': return 'bg-white text-primary border-border';
      case 'resolved': return 'bg-white text-primary border-border';
      default: return 'bg-white text-primary border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-white text-primary border-border';
      case 'medium': return 'bg-white text-primary border-border';
      case 'high': return 'bg-white text-primary border-border';
      case 'urgent': return 'bg-white text-primary border-border';
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
              <Headphones className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Customer Support</h1>
                <p className="text-muted-foreground">Get help when you need it</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-white text-primary border-border">
                Response time: &lt; 2 hours
              </Badge>
              <AnimatedButton
                onClick={() => setIsChatOpen(!isChatOpen)}
                variant="outline"
                className="gap-2"
              >
                <Bot className="w-4 h-4" />
                Quick Chat
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-fit grid-cols-4 mb-8">
              <TabsTrigger value="contact">Contact Form</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="chat">Live Chat</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="contact">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-white border border-border">
                  <CardHeader className="text-center">
                    <CardTitle>Submit a Support Request</CardTitle>
                    <CardDescription>
                      Describe your issue and we'll get back to you within 24 hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quick Contact Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                      <div className="text-center space-y-2">
                        <Mail className="w-6 h-6 text-primary mx-auto" />
                        <p className="text-sm font-medium">Email Support</p>
                        <p className="text-xs text-muted-foreground">support@africonnect.com</p>
                      </div>
                      <div className="text-center space-y-2">
                        <Phone className="w-6 h-6 text-primary mx-auto" />
                        <p className="text-sm font-medium">Phone Support</p>
                        <p className="text-xs text-muted-foreground">+44 20 1234 5678</p>
                      </div>
                      <div className="text-center space-y-2">
                        <Clock className="w-6 h-6 text-primary mx-auto" />
                        <p className="text-sm font-medium">Business Hours</p>
                        <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-6PM GMT</p>
                      </div>
                    </div>

                    {/* Contact Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Your Name</Label>
                        <Input 
                          placeholder="Enter your full name"
                          value={ticketForm.name}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input 
                          type="email"
                          placeholder="your@email.com"
                          value={ticketForm.email}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input 
                        placeholder="Brief description of your issue"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={ticketForm.category} onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityLevels.map(level => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        placeholder="Please describe your issue in detail..."
                        className="min-h-[120px]"
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum 20 characters ({ticketForm.description.length}/500)
                      </p>
                    </div>

                    <AnimatedButton 
                      onClick={handleSubmitTicket}
                      className="w-full gap-2"
                      animationType="glow"
                    >
                      <Send className="w-4 h-4" />
                      Submit Request
                    </AnimatedButton>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tickets">
              <div className="space-y-4">
                {mockTickets.length === 0 ? (
                  <Card className="bg-white border border-border">
                    <CardContent className="text-center py-12">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No support tickets</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't submitted any support requests yet.
                      </p>
                      <AnimatedButton onClick={() => setActiveTab('contact')}>
                        Submit Your First Request
                      </AnimatedButton>
                    </CardContent>
                  </Card>
                ) : (
                  mockTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white border border-border hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-medium text-foreground">{ticket.subject}</h3>
                                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                  {ticket.status}
                                </Badge>
                                <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                                  {ticket.priority}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground">#{ticket.id}</p>
                              <p className="text-sm text-foreground">{ticket.description}</p>
                              
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>Created: {new Date(ticket.createdDate).toLocaleDateString()}</span>
                                <span>Updated: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTicket(ticket.id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-white border border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      AfriConnect Assistant
                    </CardTitle>
                    <CardDescription>Get instant answers to common questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Chat Messages */}
                    <div className="h-96 border border-border rounded-lg p-4 mb-4 overflow-y-auto bg-muted/10">
                      <div className="space-y-4">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                message.sender === 'user'
                                  ? 'bg-primary text-white'
                                  : 'bg-white border border-border text-foreground'
                              }`}
                            >
                              {message.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      />
                      <AnimatedButton 
                        onClick={handleSendChatMessage}
                        disabled={!chatInput.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </AnimatedButton>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        'How do I track my order?',
                        'Payment not working',
                        'Seller verification help',
                        'Account issues'
                      ].map((quickAction) => (
                        <Button
                          key={quickAction}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setChatInput(quickAction);
                            handleSendChatMessage();
                          }}
                          className="text-xs"
                        >
                          {quickAction}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="faq">
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search frequently asked questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="orders">Orders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white border border-border">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="font-medium text-foreground pr-4">{faq.question}</h3>
                              <Badge variant="outline" className="bg-white text-primary border-border">
                                {faq.category}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <span className="text-xs text-muted-foreground">
                                {faq.helpful} people found this helpful
                              </span>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-xs">
                                  👍 Helpful
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs">
                                  👎 Not helpful
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <Card className="bg-white border border-border">
                    <CardContent className="text-center py-12">
                      <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search or contact our support team directly.
                      </p>
                      <AnimatedButton onClick={() => setActiveTab('contact')}>
                        Contact Support
                      </AnimatedButton>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Ticket Details Modal */}
      <CustomModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Ticket Details"
        description="View complete information about your support request"
        size="md"
      >
        {selectedTicket && (
          <div className="space-y-4">
            {(() => {
              const ticket = mockTickets.find(t => t.id === selectedTicket);
              if (!ticket) return null;
              
              return (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Demo Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      This demonstrates the support ticket system. In production, this would show the complete conversation history and allow responses.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket ID</p>
                      <p className="font-medium text-foreground">{ticket.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subject</p>
                      <p className="font-medium text-foreground">{ticket.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
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