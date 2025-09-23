import { useState } from 'react';
import { AdvertHeader } from './adverts/AdvertHeader';
import { AdvertStats } from './adverts/AdvertStats';
import { AdvertFilters } from './adverts/AdvertFilters';
import { AdvertTabs } from './adverts/AdvertTabs';
import { AdvertModal } from './adverts/AdvertModal';
import { AdvertAlert } from './adverts/AdvertAlert';

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
  createdAt: string;
  expiresAt: string;
  location: string;
}

// Clean mock data
const mockAdverts: Advert[] = [
  {
    id: '1',
    title: 'Premium African Textiles - Direct from Manufacturers',
    description: 'High-quality traditional and modern African fabrics. Wholesale and retail available.',
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
    description: 'Fresh, organic spices and herbs sourced directly from African farms.',
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
    description: 'Beautiful handcrafted furniture made from sustainable African hardwoods.',
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
  },
  {
    id: '4',
    title: 'Solar Panel Installation Services',
    description: 'Professional solar panel installation for homes and businesses.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
    category: 'Services',
    price: '£1500-8000',
    duration: 60,
    status: 'pending',
    views: 189,
    clicks: 23,
    createdAt: '2024-01-25',
    expiresAt: '2024-03-26',
    location: 'Johannesburg, South Africa'
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
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired' | 'draft' | 'pending' | 'paused'>('all');
  const [adverts, setAdverts] = useState<Advert[]>(mockAdverts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdvert, setSelectedAdvert] = useState<Advert | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter adverts
  const filteredAdverts = adverts.filter(advert => {
    const matchesTab = activeTab === 'all' || advert.status === activeTab;
    const matchesSearch = advert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || advert.category === selectedCategory;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  // Calculate stats
  const stats = {
    total: adverts.length,
    active: adverts.filter(a => a.status === 'active').length,
    totalViews: adverts.reduce((sum, advert) => sum + advert.views, 0),
    totalClicks: adverts.reduce((sum, advert) => sum + advert.clicks, 0),
    expired: adverts.filter(a => a.status === 'expired').length,
    draft: adverts.filter(a => a.status === 'draft').length,
    pending: adverts.filter(a => a.status === 'pending').length,
    paused: adverts.filter(a => a.status === 'paused').length,
    totalSpent: adverts.reduce((sum, advert) => sum + (advert.clicks * 2.5), 0), // Mock calculation
    totalBudget: adverts.length * 100 // Mock budget
  };

  const showAlertMessage = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    showAlertMessage('success', 'Data refreshed successfully');
  };

  const handleCreateAdvert = (formData: any) => {
    const newAdvert: Advert = {
      id: Date.now().toString(),
      ...formData,
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      status: 'draft',
      views: 0,
      clicks: 0,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: 'London, UK'
    };

    setAdverts(prev => [newAdvert, ...prev]);
    showAlertMessage('success', 'Advert created successfully!');
  };

  const handleEditAdvert = (formData: any) => {
    if (selectedAdvert) {
      setAdverts(prev => prev.map(advert => 
        advert.id === selectedAdvert.id 
          ? { ...advert, ...formData }
          : advert
      ));
      showAlertMessage('success', 'Advert updated successfully!');
    }
  };

  const handleDeleteAdvert = (id: string) => {
    setAdverts(prev => prev.filter(advert => advert.id !== id));
    showAlertMessage('success', 'Advert deleted successfully');
  };

  const handleOpenEditModal = (advert: Advert) => {
    setSelectedAdvert(advert);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdvertHeader
        totalAdverts={stats.total}
        totalSpent={stats.totalSpent}
        totalBudget={stats.totalBudget}
        onCreateAdvert={() => setShowCreateModal(true)}
        onRefresh={handleRefresh}
        onSettings={() => {}}
        isRefreshing={isRefreshing}
      />

      <div className="container mx-auto px-4 py-6">
        <AdvertStats stats={stats} />
        
        <AdvertFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        <AdvertTabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as any)}
          adverts={filteredAdverts}
          onCreateAdvert={() => setShowCreateModal(true)}
          onEditAdvert={handleOpenEditModal}
          onDeleteAdvert={handleDeleteAdvert}
          stats={stats}
        />
      </div>

      {/* Create Modal */}
      <AdvertModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAdvert}
        categories={categories}
      />

      {/* Edit Modal */}
      <AdvertModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAdvert(null);
        }}
        onSubmit={handleEditAdvert}
        isEdit={true}
        initialData={selectedAdvert}
        categories={categories}
      />

      {/* Alert */}
      <AdvertAlert
        isVisible={showAlert}
        message={alertMessage}
        type={alertType}
      />
    </div>
  );
}