import { motion } from 'framer-motion';
import { BarChart3, Eye, TrendingUp, CheckCircle, Clock, PauseCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface AdvertStatsProps {
  stats: {
    active: number;
    totalViews: number;
    totalClicks: number;
    expired: number;
    pending: number;
    paused: number;
  };
}

export function AdvertStats({ stats }: AdvertStatsProps) {
  const statItems = [
    {
      label: 'Active Adverts',
      value: stats.active,
      icon: CheckCircle,
      color: 'emerald'
    },
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: AlertCircle,
      color: 'amber'
    },
     {
      label: 'Paused',
      value: stats.paused,
      icon: PauseCircle,
      color: 'orange'
    },
    {
      label: 'Expired',
      value: stats.expired,
      icon: Clock,
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
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
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getColorClasses(item.color)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">
                    {item.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
