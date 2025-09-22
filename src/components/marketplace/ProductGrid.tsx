import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '../LoadingSpinner';
import { Button } from '../ui/button';
import { AlertCircle, Package } from 'lucide-react';

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

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onNavigate: (page: string, productId?: number) => void;
  onAddToCart: (product: any) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  currency?: string;
  searchQuery?: string;
  noResultsMessage?: string;
}

export function ProductGrid({
  products,
  loading = false,
  onNavigate,
  onAddToCart,
  onLoadMore,
  hasMore = false,
  currency = "£",
  searchQuery = "",
  noResultsMessage
}: ProductGridProps) {
  
  // Generate appropriate no results message based on context
  const getNoResultsMessage = () => {
    if (noResultsMessage) return noResultsMessage;
    
    if (searchQuery.length > 0) {
      return `No products found for "${searchQuery}". Try a different keyword.`;
    }
    
    return "No products found. Try adjusting your filters.";
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // No results state  
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-accent/50 rounded-lg">
        <div className="w-16 h-16 mb-4 rounded-full bg-background flex items-center justify-center">
          {searchQuery ? (
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          ) : (
            <Package className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {searchQuery ? "No products found" : "No products available"}
        </h3>
        
        <p className="text-sm text-muted-foreground max-w-md mb-6 px-4">
          {getNoResultsMessage()}
        </p>

        {searchQuery && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Try:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Using different keywords</li>
              <li>Checking your spelling</li>
              <li>Using more general search terms</li>
              <li>Browsing categories instead</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onNavigate={onNavigate}
            onAddToCart={onAddToCart}
            animationDelay={index * 0.05}
            currency={currency}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            className="w-full sm:w-auto"
          >
            Load More Products
          </Button>
        </div>
      )}

      {/* Results Info */}
      {products.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}
    </div>
  );
}