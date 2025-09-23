import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Eye, Edit, Trash2, TrendingUp, Calendar, MapPin, Tag, Clock, AlertCircle, MoreVertical, BarChart3, RefreshCw, Share2, Copy, ExternalLink, Heart, MessageCircle, Settings } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdvertsPageProps {
  onNavigate: (page: string) => void;
}

interface Advert {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: string;
  duration: number;
  status: 'active' | 'expired' | 'draft' | 'pending' | 'paused';
  views: number;
  clicks: number;
  impressions: number;
  ctr: number; // Click-through rate
  budget: number;
  spent: number;
  createdAt: string;
  expiresAt: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: string[];
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

// Enhanced mock data with more comprehensive information
const mockAdverts: Advert[] = [
  {
    id: '1',
    title: 'Premium African Textiles - Direct from Manufacturers',
    description: 'High-quality traditional and modern African fabrics. Wholesale and retail available. Perfect for fashion designers and retailers looking for authentic materials.',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2b013?w=400',
    category: 'Fashion & Textiles',
    price: '£25-150',
    duration: 30,
    status: 'active',
    views: 1247,
    clicks: 89,
    impressions: 15600,
    ctr: 5.7,
    budget: 250,
    spent: 180,
    createdAt: '2024-01-15',
    expiresAt: '2024-02-14',
    location: 'Lagos, Nigeria',
    priority: 'high',
    targetAudience: ['Fashion Designers', 'Retailers', 'Wholesalers'],
    performance: 'excellent'
  },
  {
    id: '2',
    title: 'Organic Spices & Herbs Collection',
    description: 'Fresh, organic spices and herbs sourced directly from African farms. Perfect for restaurants and food distributors seeking authentic flavors.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    category: 'Food & Agriculture',
    price: '£12-85',
    duration: 14,
    status: 'active',
    views: 856,
    clicks: 67,
    impressions: 12400,
    ctr: 5.4,
    budget: 150,
    spent: 95,
    createdAt: '2024-01-20',
    expiresAt: '2024-02-03',
    location: 'Accra, Ghana',
    priority: 'medium',
    targetAudience: ['Restaurants', 'Food Distributors', 'Chefs'],
    performance: 'good'
  },
  {
    id: '3',
    title: 'Handcrafted Wooden Furniture',
    description: 'Beautiful handcrafted furniture made from sustainable African hardwoods. Custom designs available for unique spaces.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    category: 'Home & Decor',
    price: '£200-1500',
    duration: 30,
    status: 'expired',
    views: 234,
    clicks: 12,
    impressions: 8900,
    ctr: 1.3,
    budget: 300,
    spent: 300,
    createdAt: '2023-12-01',
    expiresAt: '2023-12-31',
    location: 'Nairobi, Kenya',
    priority: 'low',
    targetAudience: ['Interior Designers', 'Homeowners', 'Hotels'],
    performance: 'poor'
  },
  {
    id: '4',
    title: 'Tech Training Bootcamp - Web Development',
    description: 'Intensive 12-week bootcamp covering modern web development technologies. Get job-ready skills with hands-on projects.',
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400',
    category: 'Education',
    price: '£299-599',
    duration: 45,
    status: 'paused',
    views: 567,
    clicks: 45,
    impressions: 9800,
    ctr: 4.6,
    budget: 200,
    spent: 120,
    createdAt: '2024-01-10',
    expiresAt: '2024-02-25',
    location: 'Cape Town, South Africa',
    priority: 'high',
    targetAudience: ['Students', 'Career Changers', 'Professionals'],
    performance: 'good'
  },
  {
    id: '5',
    title: 'Solar Panel Installation Services',
    description: 'Professional solar panel installation for homes and businesses. Reduce energy costs and environmental impact.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
    category: 'Services',
    price: '£1500-8000',
    duration: 60,
    status: 'pending',
    views: 189,
    clicks: 23,
    impressions: 5600,
    ctr: 4.1,
    budget: 400,
    spent: 85,
    createdAt: '2024-01-25',
    expiresAt: '2024-03-26',
    location: 'Johannesburg, South Africa',
    priority: 'medium',
    targetAudience: ['Homeowners', 'Businesses', 'Environmentalists'],
    performance: 'average'
  }
];

const categories = [
  'All Categories',
  'Fashion & Textiles',
  'Food & Agriculture', 
  'Home & Decor',
  'Electronics',
  'Health & Beauty',
  'Automotive',
  'Services',
  'Education',
  'Technology',
  'Business',
  'Art & Crafts'
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'views', label: 'Most Views' },
  { value: 'clicks', label: 'Most Clicks' },
  { value: 'performance', label: 'Best Performance' },
  { value: 'budget', label: 'Highest Budget' }
];

export function AdvertsPage({ onNavigate }: AdvertsPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired' | 'draft' | 'pending' | 'paused'>('all');
  const [adverts, setAdverts] = useState<Advert[]>(mockAdverts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedAdvert, setSelectedAdvert] = useState<Advert | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [newAdvertForm, setNewAdvertForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: 30,
    budget: 100,
    targetAudience: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredAdverts = adverts.filter(advert => {
    const matchesTab = activeTab === 'all' || advert.status === activeTab;
    const matchesSearch = advert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advert.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || advert.category === selectedCategory;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  // Sort adverts
  const sortedAdverts = [...filteredAdverts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'views':
        return b.views - a.views;
      case 'clicks':
        return b.clicks - a.clicks;
      case 'performance':
        const performanceOrder = { excellent: 4, good: 3, average: 2, poor: 1 };
        return performanceOrder[b.performance] - performanceOrder[a.performance];
      case 'budget':
        return b.budget - a.budget;
      default:
        return 0;
    }
  });

  const handleDeleteAdvert = (id: string) => {
    setAdverts(prev => prev.filter(advert => advert.id !== id));
    showAlertMessage('success', 'Advert deleted successfully');
  };

  const handlePauseAdvert = (id: string) => {
    setAdverts(prev => prev.map(advert => 
      advert.id === id 
        ? { ...advert, status: advert.status === 'paused' ? 'active' : 'paused' as any }
        : advert
    ));
    const advert = adverts.find(a => a.id === id);
    showAlertMessage('success', `Advert ${advert?.status === 'paused' ? 'resumed' : 'paused'} successfully`);
  };

  const handleDuplicateAdvert = (id: string) => {
    const advert = adverts.find(a => a.id === id);
    if (advert) {
      const newAdvert = {
        ...advert,
        id: Date.now().toString(),
        title: `${advert.title} (Copy)`,
        status: 'draft' as const,
        views: 0,
        clicks: 0,
        impressions: 0,
        spent: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAdverts(prev => [newAdvert, ...prev]);
      showAlertMessage('success', 'Advert duplicated successfully');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update some random stats to simulate real-time updates
    setAdverts(prev => prev.map(advert => ({
      ...advert,
      views: advert.views + Math.floor(Math.random() * 10),
      clicks: advert.clicks + Math.floor(Math.random() * 3),
      impressions: advert.impressions + Math.floor(Math.random() * 50)
    })));
    
    setIsRefreshing(false);
    showAlertMessage('success', 'Data refreshed successfully');
  };

  const showAlertMessage = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'expired': return 'bg-red-50 text-red-700 border-red-200';
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'paused': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreateAdvert = () => {
    const newAdvert: Advert = {
      id: Date.now().toString(),
      ...newAdvertForm,
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      status: 'draft',
      views: 0,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      spent: 0,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + newAdvertForm.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: 'London, UK',
      performance: 'average'
    };

    setAdverts(prev => [newAdvert, ...prev]);
    setShowCreateModal(false);
    setNewAdvertForm({
      title: '',
      description: '',
      category: '',
      price: '',
      duration: 30,
      budget: 100,
      targetAudience: [],
      priority: 'medium'
    });
    showAlertMessage('success', 'Advert created successfully!');
  };

  // Calculate comprehensive stats
  const stats = {
    total: adverts.length,
    active: adverts.filter(a => a.status === 'active').length,
    totalViews: adverts.reduce((sum, advert) => sum + advert.views, 0),
    totalClicks: adverts.reduce((sum, advert) => sum + advert.clicks, 0),
    totalImpressions: adverts.reduce((sum, advert) => sum + advert.impressions, 0),
    totalSpent: adverts.reduce((sum, advert) => sum + advert.spent, 0),
    totalBudget: adverts.reduce((sum, advert) => sum + advert.budget, 0),
    avgCTR: adverts.length > 0 ? adverts.reduce((sum, advert) => sum + advert.ctr, 0) / adverts.length : 0,
    expired: adverts.filter(a => a.status === 'expired').length,
    draft: adverts.filter(a => a.status === 'draft').length,
    pending: adverts.filter(a => a.status === 'pending').length,
    paused: adverts.filter(a => a.status === 'paused').length
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Enhanced Mobile-first Header */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-foreground">My Adverts</h1>
                  <Badge variant="secondary" className="text-xs">
                    {stats.total} Total
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  Manage campaigns • £{stats.totalSpent.toFixed(0)} spent of £{stats.totalBudget.toFixed(0)} budget
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh data</TooltipContent>
                </Tooltip>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Export Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  onClick={() => setShowCreateModal(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Enhanced Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 mb-6"
          >
            <Card className="col-span-1">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-foreground">{stats.active}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Views</div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-xl font-bold text-foreground">{stats.totalClicks}</div>
                <div className="text-xs text-muted-foreground">Clicks</div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-xl font-bold text-foreground">{stats.avgCTR.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Avg CTR</div>
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Tag className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-foreground">£{stats.totalSpent}</div>
                <div className="text-xs text-muted-foreground">Spent</div>
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-rose-600" />
                </div>
                <div className="text-xl font-bold text-foreground">{stats.expired}</div>
                <div className="text-xs text-muted-foreground">Expired</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Search and Filters - Side by Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 mb-6"
          >
            {/* Search and Category Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Search adverts by title, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
              
              <div className="flex gap-2 sm:w-auto">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                High Priority ({adverts.filter(a => a.priority === 'high').length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Excellent Performance ({adverts.filter(a => a.performance === 'excellent').length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Expiring Soon ({adverts.filter(a => getDaysRemaining(a.expiresAt) <= 7 && a.status === 'active').length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Over Budget ({adverts.filter(a => a.spent > a.budget * 0.9).length})
              </Badge>
            </div>
          </motion.div>

          {/* Enhanced Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6 h-10">
                <TabsTrigger value="all" className="text-xs px-2">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs px-2">
                  Active ({stats.active})
                </TabsTrigger>
                <TabsTrigger value="paused" className="text-xs px-2">
                  Paused ({stats.paused})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs px-2">
                  Pending ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="expired" className="text-xs px-2">
                  Expired ({stats.expired})
                </TabsTrigger>
                <TabsTrigger value="draft" className="text-xs px-2">
                  Draft ({stats.draft})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <AnimatePresence>
                  {sortedAdverts.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No adverts found</h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                        {activeTab === 'all' 
                          ? "You haven't created any adverts yet. Create your first advert to start reaching more customers." 
                          : `No ${activeTab} adverts found. Try adjusting your filters or search terms.`
                        }
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={() => setShowCreateModal(true)}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Create Your First Advert
                        </Button>
                        {searchQuery && (
                          <Button
                            variant="outline"
                            onClick={() => setSearchQuery('')}
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {sortedAdverts.map((advert, index) => (
                        <motion.div
                          key={advert.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
                            <CardContent className="p-0">
                              <div className="flex flex-col md:flex-row">
                                {/* Enhanced Image Section */}
                                <div className="w-full md:w-48 h-48 md:h-auto relative">
                                  <ImageWithFallback
                                    src={advert.image}
                                    alt={advert.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 left-2">
                                    <Badge className={getPriorityColor(advert.priority)}>
                                      {advert.priority}
                                    </Badge>
                                  </div>
                                  <div className="absolute top-2 right-2">
                                    <Badge variant="outline" className={`text-xs ${getStatusColor(advert.status)}`}>
                                      {advert.status}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Enhanced Content Section */}
                                <div className="flex-1 p-6">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">
                                        {advert.title}
                                      </h3>
                                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {advert.description}
                                      </p>
                                    </div>

                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedAdvert(advert);
                                            setShowEditModal(true);
                                          }}
                                        >
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit Advert
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDuplicateAdvert(advert.id)}
                                        >
                                          <Copy className="w-4 h-4 mr-2" />
                                          Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handlePauseAdvert(advert.id)}
                                        >
                                          {advert.status === 'paused' ? (
                                            <>
                                              <TrendingUp className="w-4 h-4 mr-2" />
                                              Resume
                                            </>
                                          ) : (
                                            <>
                                              <Clock className="w-4 h-4 mr-2" />
                                              Pause
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                          <Share2 className="w-4 h-4 mr-2" />
                                          Share
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <BarChart3 className="w-4 h-4 mr-2" />
                                          View Analytics
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteAdvert(advert.id)}
                                          className="text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  {/* Enhanced Meta Information */}
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      <span>{advert.category}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>{advert.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        {advert.status === 'active' 
                                          ? `${getDaysRemaining(advert.expiresAt)} days left`
                                          : `Created ${advert.createdAt}`
                                        }
                                      </span>
                                    </div>
                                    <div className={`flex items-center gap-1 font-medium ${getPerformanceColor(advert.performance)}`}>
                                      <BarChart3 className="w-3 h-3" />
                                      <span className="capitalize">{advert.performance}</span>
                                    </div>
                                  </div>

                                  {/* Enhanced Stats Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="text-center">
                                      <div className="text-sm font-semibold text-foreground">{advert.views.toLocaleString()}</div>
                                      <div className="text-xs text-muted-foreground">Views</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-sm font-semibold text-foreground">{advert.clicks}</div>
                                      <div className="text-xs text-muted-foreground">Clicks</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-sm font-semibold text-foreground">{advert.ctr.toFixed(1)}%</div>
                                      <div className="text-xs text-muted-foreground">CTR</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-sm font-semibold text-foreground">{advert.price}</div>
                                      <div className="text-xs text-muted-foreground">Price Range</div>
                                    </div>
                                  </div>

                                  {/* Budget Progress */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">Budget Progress</span>
                                      <span className="font-medium">£{advert.spent} / £{advert.budget}</span>
                                    </div>
                                    <Progress 
                                      value={(advert.spent / advert.budget) * 100} 
                                      className="h-2"
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Enhanced Create/Edit Modal */}
        <Dialog open={showCreateModal || showEditModal} onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedAdvert(null);
          }
        }}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {showCreateModal ? "Create New Advert" : "Edit Advert"}
              </DialogTitle>
              <DialogDescription>
                {showCreateModal 
                  ? "Create a promotional advert to increase visibility and reach more customers" 
                  : "Edit your existing advert to improve performance"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter advert title"
                    value={newAdvertForm.title}
                    onChange={(e) => setNewAdvertForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newAdvertForm.category}
                    onValueChange={(value) => setNewAdvertForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price Range *</Label>
                  <Input
                    id="price"
                    placeholder="e.g., £25-150"
                    value={newAdvertForm.price}
                    onChange={(e) => setNewAdvertForm(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (£) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="10"
                    max="10000"
                    value={newAdvertForm.budget}
                    onChange={(e) => setNewAdvertForm(prev => ({ ...prev, budget: parseInt(e.target.value) || 100 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days) *</Label>
                  <Select
                    value={newAdvertForm.duration.toString()}
                    onValueChange={(value) => setNewAdvertForm(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newAdvertForm.priority}
                    onValueChange={(value) => setNewAdvertForm(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product or service in detail..."
                  rows={4}
                  value={newAdvertForm.description}
                  onChange={(e) => setNewAdvertForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Demo Mode</AlertTitle>
                <AlertDescription className="text-sm">
                  This is a demonstration. In the full version, you can upload images, 
                  set detailed targeting options, and track comprehensive analytics.
                </AlertDescription>
              </Alert>

              <Separator />

              {/* Side by side buttons as requested */}
              <div className="flex flex-row gap-3 pt-2">
                <Button
                  onClick={showCreateModal ? handleCreateAdvert : () => {
                    showAlertMessage('success', 'Advert updated successfully!');
                    setShowEditModal(false);
                  }}
                  className="flex-1"
                  disabled={!newAdvertForm.title || !newAdvertForm.category || !newAdvertForm.price || !newAdvertForm.description}
                >
                  {showCreateModal ? 'Create Advert' : 'Update Advert'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedAdvert(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Modal */}
        <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>Advert Settings</DialogTitle>
              <DialogDescription>
                Configure your advert management preferences
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Refresh</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh data every 30 seconds
                  </p>
                </div>
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <Separator />

              <div className="flex flex-row gap-3">
                <Button
                  onClick={() => {
                    setShowSettingsModal(false);
                    showAlertMessage('success', 'Settings saved successfully');
                  }}
                  className="flex-1"
                >
                  Save Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Alert Toast */}
        <AnimatePresence>
          {showAlert && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
            >
              <Alert className={`border-2 ${
                alertType === 'success' ? 'bg-green-50 border-green-200' :
                alertType === 'error' ? 'bg-red-50 border-red-200' :
                alertType === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <AlertCircle className={`h-4 w-4 ${
                  alertType === 'success' ? 'text-green-600' :
                  alertType === 'error' ? 'text-red-600' :
                  alertType === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <AlertDescription className={`${
                  alertType === 'success' ? 'text-green-800' :
                  alertType === 'error' ? 'text-red-800' :
                  alertType === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {alertMessage}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}