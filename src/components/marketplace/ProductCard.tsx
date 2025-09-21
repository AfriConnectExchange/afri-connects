import { Star, Heart, ShoppingCart, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { FreeListingBadge, GifterBadge } from './FreeListingBadge';
import { motion } from 'motion/react';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  seller: string;
  sellerVerified: boolean;
  image: string;
  category: string;
  featured?: boolean;
  discount?: number;
  isFree?: boolean;
  isGifterListing?: boolean;
  location?: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair';
  shippingType?: 'free' | 'paid' | 'pickup-only';
  estimatedDelivery?: string;
}

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, productId?: number) => void;
  onAddToCart: (product: any) => void;
  animationDelay?: number;
  currency?: string;
}

export function ProductCard({ 
  product, 
  onNavigate, 
  onAddToCart, 
  animationDelay = 0,
  currency = "£"
}: ProductCardProps) {
  
  const formatPrice = (price: number) => `${currency}${price.toLocaleString()}`;

  const handleAddToCart = () => {
    if (product.isFree) {
      // Free items go directly to "claim" flow
      onNavigate('product', product.id);
      return;
    }

    onAddToCart({
      ...product,
      quantity: 1,
      inStock: true,
      shippingCost: product.shippingType === 'free' ? 0 : Math.floor(Math.random() * 10) + 5,
      estimatedDelivery: product.estimatedDelivery || '5-7 business days'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
    >
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Image Section */}
          <div className="relative overflow-hidden rounded-t-lg">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onClick={() => onNavigate('product', product.id)}
            />
            
            {/* Badges Overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isFree && <FreeListingBadge variant="compact" />}
              {product.featured && !product.isFree && (
                <Badge className="bg-primary text-white text-xs">Featured</Badge>
              )}
              {product.discount && !product.isFree && (
                <Badge variant="destructive" className="text-xs">-{product.discount}%</Badge>
              )}
              {product.condition && product.condition !== 'new' && (
                <Badge variant="outline" className="text-xs bg-white/90">
                  {product.condition.replace('-', ' ')}
                </Badge>
              )}
            </div>
            
            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white w-8 h-8"
              onClick={(e) => {
                e.stopPropagation();
                // Handle wishlist toggle
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>

            {/* Shipping Info */}
            {product.shippingType === 'free' && !product.isFree && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  Free Shipping
                </Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Title */}
            <h3 
              className="mb-2 line-clamp-2 cursor-pointer hover:text-primary text-sm font-medium leading-tight"
              onClick={() => onNavigate('product', product.id)}
            >
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">by {product.seller}</span>
              {product.sellerVerified && (
                <Badge variant="secondary" className="text-xs">Verified</Badge>
              )}
              {product.isGifterListing && <GifterBadge />}
            </div>

            {/* Location */}
            {product.location && (
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{product.location}</span>
              </div>
            )}

            {/* Delivery Time */}
            {product.estimatedDelivery && !product.isFree && (
              <div className="flex items-center gap-1 mb-3">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{product.estimatedDelivery}</span>
              </div>
            )}

            {/* Price and Action - Push to bottom */}
            <div className="flex justify-between items-center mt-auto">
              <div>
                {product.isFree ? (
                  <span className="text-lg font-semibold text-green-600">Free</span>
                ) : (
                  <>
                    <span className="text-lg font-semibold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </>
                )}
              </div>
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                variant={product.isFree ? "outline" : "default"}
                className="flex items-center gap-1 text-xs"
              >
                {product.isFree ? (
                  <>
                    <Heart className="w-3 h-3" />
                    <span className="hidden sm:inline">Claim</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3" />
                    <span className="hidden sm:inline">Add</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}