import { motion } from 'motion/react';
import { MoreVertical, Edit, Trash2, Eye, TrendingUp, Tag, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
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
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'expired': return 'bg-red-50 text-red-700 border-red-200';
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'paused': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            {/* Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
              <ImageWithFallback
                src={advert.image}
                alt={advert.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-base text-foreground line-clamp-1 flex-1">
                  {advert.title}
                </h3>
                <div className="flex items-center gap-2 ml-2">
                  <Badge variant="outline" className={`text-xs ${getStatusColor(advert.status)}`}>
                    {advert.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={() => onEdit(advert)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(advert.id)}
                        className="text-destructive"
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
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{advert.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{advert.clicks}</span>
                  </div>
                </div>
                <div className="font-medium text-foreground text-sm">
                  {advert.price}
                </div>
              </div>

              {/* Meta info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span className="truncate">{advert.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {advert.status === 'active' 
                      ? `${getDaysRemaining(advert.expiresAt)}d left`
                      : 'Expired'
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