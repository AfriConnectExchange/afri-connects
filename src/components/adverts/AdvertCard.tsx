
import { motion } from 'framer-motion';
import { MoreVertical, Edit, Trash2, Eye, TrendingUp, Tag, Calendar, MapPin, Play, Pause, Power, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ImageWithFallback } from '../figma/ImageWithFallback';

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
  duration: number;
}

interface AdvertCardProps {
  advert: Advert;
  onEdit: (advert: Advert) => void;
  onDelete: (id: string) => void;
  index?: number;
}

export function AdvertCard({ advert, onEdit, onDelete, index = 0 }: AdvertCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'expired': return 'bg-red-100 text-red-700 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'paused': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(advert.expiresAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            {/* Image */}
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0 relative">
              <ImageWithFallback
                src={advert.image}
                alt={advert.title}
                className="w-full h-full object-cover"
              />
               <Badge variant="outline" className={`absolute top-1.5 left-1.5 text-xs ${getStatusColor(advert.status)}`}>
                    {advert.status}
                </Badge>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-base text-foreground line-clamp-1 flex-1">
                  {advert.title}
                </h3>
                <div className="flex items-center gap-2 ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                       <DropdownMenuItem><Play className="w-4 h-4 mr-2"/>Resume</DropdownMenuItem>
                       <DropdownMenuItem><Pause className="w-4 h-4 mr-2"/>Pause</DropdownMenuItem>
                       <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(advert)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => {}}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Stats
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(advert.id)}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {advert.description}
              </p>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1" title="Views">
                    <Eye className="w-3 h-3" />
                    <span>{advert.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Clicks">
                    <TrendingUp className="w-3 h-3" />
                    <span>{advert.clicks}</span>
                  </div>
                   <div className="flex items-center gap-1" title="Category">
                     <Tag className="w-3 h-3" />
                     <span className="truncate">{advert.category}</span>
                   </div>
                </div>
                <div className="font-medium text-foreground text-sm">
                  {advert.price}
                </div>
              </div>

              {/* Meta info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{advert.location}</span>
                </div>
                 <div className="flex items-center gap-1" title="Days remaining">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {daysRemaining > 0
                      ? `${daysRemaining}d left`
                      : advert.status === 'expired' ? 'Expired' : 'Ending soon'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
