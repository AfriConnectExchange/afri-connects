import { motion, AnimatePresence } from 'motion/react';
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Tabs value={activeTab} onValueChange={onTabChange}>
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
            {adverts.length === 0 ? (
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
              </motion.div>
            ) : (
              <div className="space-y-4">
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
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}