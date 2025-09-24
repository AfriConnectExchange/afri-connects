import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { AdvertCard } from './AdvertCard';

interface Advert {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: string;
  status: 'active' | 'expired' | 'draft' | 'pending' | 'paused';
  views: number;
  clicks: number;
  createdAt: string;
  expiresAt: string;
  location: string;
}

interface AdvertTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  adverts: Advert[];
  onCreateAdvert: () => void;
  onEditAdvert: (advert: Advert) => void;
  onDeleteAdvert: (id: string) => void;
  stats: {
    total: number;
    active: number;
    expired: number;
    draft: number;
    pending: number;
    paused: number;
  };
}

export function AdvertTabs({ 
  activeTab, 
  onTabChange, 
  adverts, 
  onCreateAdvert, 
  onEditAdvert, 
  onDeleteAdvert, 
  stats 
}: AdvertTabsProps) {
  const tabItems = [
    { value: "all", label: "All", count: stats.total },
    { value: "active", label: "Active", count: stats.active },
    { value: "paused", label: "Paused", count: stats.paused },
    { value: "pending", label: "Pending", count: stats.pending },
    { value: "expired", label: "Expired", count: stats.expired },
    { value: "draft", label: "Drafts", count: stats.draft }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <div className="w-full overflow-x-auto pb-1 no-scrollbar">
          <TabsList className="inline-flex w-auto mb-6">
            {tabItems.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-sm px-4">
                {tab.label} <span className="ml-1.5 bg-muted/80 text-muted-foreground rounded-full px-2 py-0.5 text-xs font-mono">{tab.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {adverts.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No adverts found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {activeTab === 'all' 
                    ? "You haven't created any adverts yet. Create your first advert to start reaching more customers." 
                    : `No ${activeTab} adverts found.`
                  }
                </p>
                <Button
                  onClick={onCreateAdvert}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Advert
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {adverts.map((advert, index) => (
                  <AdvertCard
                    key={advert.id}
                    advert={advert}
                    onEdit={onEditAdvert}
                    onDelete={onDeleteAdvert}
                    index={index}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}
