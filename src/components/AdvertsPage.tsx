import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Eye, Edit, Trash2, TrendingUp, Calendar, MapPin, Tag, Clock, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CustomAlert } from './ui/custom-alert';
import { CustomModal } from './ui/custom-modal';
import { AnimatedButton } from './ui/animated-button';
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
  status: 'active' | 'expired' | 'draft';
  views: number;
  clicks: number;
  createdAt: string;
  expiresAt: string;
  location: string;
}

// Mock data for demonstration
const mockAdverts: Advert[] = [
  {
    id: '1',
    title: 'Premium African Textiles - Direct from Manufacturers',
    description: 'High-quality traditional and modern African fabrics. Wholesale and retail available. Perfect for fashion designers and retailers.',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2b013?w=400',
    category: 'Fashion & Textiles',
    price: '£25-150',
    duration: 30,
    status: 'active',
    views: 1247,
    clicks: 89,
    createdAt: '2024-01-15',
    expiresAt: '2024-02-14',
    location: 'Lagos, Nigeria'
  },
  {
    id: '2',
    title: 'Organic Spices & Herbs Collection',
    description: 'Fresh, organic spices and herbs sourced directly from African farms. Perfect for restaurants and food distributors.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    category: 'Food & Agriculture',
    price: '£12-85',
    duration: 14,
    status: 'active',
    views: 856,
    clicks: 67,
    createdAt: '2024-01-20',
    expiresAt: '2024-02-03',
    location: 'Accra, Ghana'
  },
  {
    id: '3',
    title: 'Handcrafted Wooden Furniture',
    description: 'Beautiful handcrafted furniture made from sustainable African hardwoods. Custom designs available.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    category: 'Home & Decor',
    price: '£200-1500',
    duration: 30,
    status: 'expired',
    views: 234,
    clicks: 12,
    createdAt: '2023-12-01',
    expiresAt: '2023-12-31',
    location: 'Nairobi, Kenya'
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
  'Education'
];

export function AdvertsPage({ onNavigate }: AdvertsPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired' | 'draft'>('all');
  const [adverts, setAdverts] = useState<Advert[]>(mockAdverts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdvert, setSelectedAdvert] = useState<Advert | null>(null);
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

  const filteredAdverts = adverts.filter(advert => {
    const matchesTab = activeTab === 'all' || advert.status === activeTab;
    const matchesSearch = advert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || advert.category === selectedCategory;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleDeleteAdvert = (id: string) => {
    setAdverts(prev => prev.filter(advert => advert.id !== id));
    showAlert('success', 'Advert Deleted', 'Your advert has been successfully deleted.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            >
              <h1 className="text-2xl font-bold text-foreground mb-2">My Adverts</h1>
              <p className="text-muted-foreground">Manage your promotional campaigns and track performance</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AnimatedButton
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
                animationType="glow"
              >
                <Plus className="w-4 h-4" />
                <span>Create Advert</span>
              </AnimatedButton>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {adverts.filter(a => a.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Adverts</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-4">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {adverts.reduce((sum, advert) => sum + advert.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {adverts.reduce((sum, advert) => sum + advert.clicks, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Clicks</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mx-auto mb-4">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {adverts.filter(a => a.status === 'expired').length}
              </div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search adverts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All ({adverts.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({adverts.filter(a => a.status === 'active').length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({adverts.filter(a => a.status === 'expired').length})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({adverts.filter(a => a.status === 'draft').length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <AnimatePresence>
                {filteredAdverts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No adverts found</h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab === 'all' 
                        ? "You haven't created any adverts yet." 
                        : `No ${activeTab} adverts found.`
                      }
                    </p>
                    <AnimatedButton
                      onClick={() => setShowCreateModal(true)}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Advert
                    </AnimatedButton>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {filteredAdverts.map((advert, index) => (
                      <motion.div
                        key={advert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow duration-200">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Image */}
                              <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-muted">
                                <ImageWithFallback
                                  src={advert.image}
                                  alt={advert.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-foreground text-lg mb-2">
                                      {advert.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                      {advert.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Tag className="w-4 h-4" />
                                        {advert.category}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {advert.location}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {advert.status === 'active' 
                                          ? `${getDaysRemaining(advert.expiresAt)} days left`
                                          : `Expired ${Math.abs(getDaysRemaining(advert.expiresAt))} days ago`
                                        }
                                      </div>
                                    </div>
                                  </div>

                                  <Badge variant="outline" className={getStatusColor(advert.status)}>
                                    {advert.status}
                                  </Badge>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Eye className="w-4 h-4" />
                                      {advert.views.toLocaleString()} views
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4" />
                                      {advert.clicks} clicks
                                    </div>
                                    <div className="font-medium text-foreground">
                                      {advert.price}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedAdvert(advert);
                                        setShowEditModal(true);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteAdvert(advert.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
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

      {/* Create/Edit Modal */}
      <CustomModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedAdvert(null);
        }}
        title={showCreateModal ? "Create New Advert" : "Edit Advert"}
        description={showCreateModal ? "Create a new promotional advert to increase visibility" : "Edit your existing advert details"}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Create promotional adverts to increase visibility and reach more customers across AfriConnect.
          </p>
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Demo Mode</span>
            </div>
            <p className="text-sm text-amber-600 mt-1">
              Advert creation is simulated. In the full version, you can upload images, set budgets, and track real analytics.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <AnimatedButton
              onClick={() => {
                showAlert('success', 'Advert Created!', 'Your advert has been submitted and will be live within 60 seconds.');
                setShowCreateModal(false);
                setShowEditModal(false);
              }}
              className="flex-1"
            >
              {showCreateModal ? 'Create Advert' : 'Update Advert'}
            </AnimatedButton>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedAdvert(null);
              }}
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