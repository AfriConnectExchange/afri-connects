import { motion } from 'motion/react';
import { TrendingUp, Eye, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface AdvertStatsProps {
  stats: {
    active: number;
    totalViews: number;
    totalClicks: number;
    expired: number;
  };
}

export function AdvertStats({ stats }: AdvertStatsProps) {
  const statItems = [
    {
      label: 'Active',
      value: stats.active,
      icon: TrendingUp,
      color: 'blue'
    },
    {
      label: 'Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'emerald'
    },
    {
      label: 'Clicks',
      value: stats.totalClicks,
      icon: BarChart3,
      color: 'purple'
    },
    {
      label: 'Expired',
      value: stats.expired,
      icon: Clock,
      color: 'amber'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
    >
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${getColorClasses(item.color)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold text-foreground mb-1">
                  {item.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}