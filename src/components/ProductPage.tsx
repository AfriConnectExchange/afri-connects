import { useState } from 'react';
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, Shield, Truck, RotateCcw, MessageCircle, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LoadingSpinner } from './LoadingSpinner';
import { motion } from 'framer-motion';

interface ProductPageProps {
  productId: number;
  onNavigate: (page: string, productId?: number) => void;
  onAddToCart: (product: any) => void;
}

export function ProductPage({ productId, onNavigate, onAddToCart }: ProductPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Mock product data
  const product = {
    id: productId,
    name: "Traditional Kente Cloth - Authentic Ghanaian Design",
    price: 125,
    originalPrice: 145,
    rating: 4.8,
    reviews: 124,
    sold: 89,
    description: "This authentic Kente cloth is hand-woven by skilled artisans in Kumasi, Ghana. Each piece tells a story through its intricate patterns and vibrant colors. Made from high-quality cotton and silk blend, this traditional textile is perfect for special occasions, cultural celebrations, or as a stunning decorative piece.",
    images: [
      "https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0cGxhY2UlMjBjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODEyMTQ3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0cGxhY2UlMjBjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODEyMTQ3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0cGxhY2UlMjBjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODEyMTQ3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    ],
    seller: {
      name: "Accra Crafts",
      verified: true,
      rating: 4.9,
      totalSales: 2456,
      memberSince: "2020",
      avatar: "https://images.unsplash.com/photo-1655720357872-ce227e4164ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBlbnRyZXByZW5ldXIlMjBidXNpbmVzc3xlbnwxfHx8fDE3NTgxMjE0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      location: "Accra, Ghana"
    },
    specifications: {
      "Material": "Cotton and Silk Blend",
      "Dimensions": "6 yards x 4 inches",
      "Weight": "300g",
      "Care Instructions": "Dry clean only",
      "Origin": "Kumasi, Ghana",
      "Artisan": "Master Weaver Kwaku Asante"
    },
    shipping: {
      domestic: "£7 (3-5 business days)",
      international: "£25 (7-14 business days)"
    },
    discount: 13,
    inStock: true,
    stockCount: 15
  };

  const reviews = [
    {
      id: 1,
      user: "Amina Hassan",
      rating: 5,
      date: "2 weeks ago",
      comment: "Absolutely beautiful! The quality is exceptional and the colors are vibrant. Exactly as described.",
      verified: true
    },
    {
      id: 2,
      user: "David Okonkwo",
      rating: 5,
      date: "1 month ago",
      comment: "Perfect for my wedding ceremony. The craftsmanship is outstanding and delivery was fast.",
      verified: true
    },
    {
      id: 3,
      user: "Sarah Mensah",
      rating: 4,
      date: "2 months ago",
      comment: "Good quality but took longer to arrive than expected. Overall satisfied with the purchase.",
      verified: true
    }
  ];

  const formatPrice = (price: number) => `£${price.toLocaleString()}`;

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 md:mb-6 text-sm text-muted-foreground">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('marketplace')}
          className="p-0 h-auto font-normal"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Marketplace
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-6 md:mb-8">
        {/* Product Images */}
        <motion.div 
          className="space-y-3 md:space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <ImageWithFallback
              src={product.images[selectedImageIndex]}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
              {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                  selectedImageIndex === index ? 'border-primary' : 'border-transparent hover:border-primary/50'
                }`}>
                <ImageWithFallback
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div 
          className="space-y-4 md:space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3 md:mb-2">
              <Badge className="bg-primary text-xs">Featured</Badge>
              {product.discount && (
                <Badge variant="destructive" className="text-xs">-{product.discount}%</Badge>
              )}
            </div>
            <h1 className="mb-3 md:mb-4 text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-sm md:text-base">{product.rating}</span>
                <span className="text-muted-foreground text-sm md:text-base">({product.reviews} reviews)</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground text-sm md:text-base">{product.sold} sold</span>
            </div>

            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <span className="text-2xl md:text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg md:text-xl text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-9 w-9"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span id="quantity" className="px-4 text-center font-medium text-sm md:text-base">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  disabled={quantity >= product.stockCount}
                  className="h-9 w-9"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {product.stockCount} pieces available
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button size="lg" className="w-full h-12" onClick={handleAddToCart}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="secondary" className="w-full h-12">
                  Buy Now
                </Button>
              </div>
              <div className="flex items-center justify-end gap-1">
                 <Button size="icon" variant="ghost" className="rounded-full">
                   <Heart className="w-5 h-5 text-muted-foreground" />
                 </Button>
                 <Button size="icon" variant="ghost" className="rounded-full">
                   <Share2 className="w-5 h-5 text-muted-foreground" />
                 </Button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 py-4 border-t border-b">
            <div className="text-center">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-green-600 mx-auto mb-1" />
              <div className="text-xs md:text-sm font-medium">Secure Payment</div>
              <div className="text-xs text-muted-foreground">Escrow Protection</div>
            </div>
            <div className="text-center">
              <Truck className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xs md:text-sm font-medium">Fast Shipping</div>
              <div className="text-xs text-muted-foreground">3-5 Business Days</div>
            </div>
            <div className="text-center">
              <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-orange-600 mx-auto mb-1" />
              <div className="text-xs md:text-sm font-medium">Easy Returns</div>
              <div className="text-xs text-muted-foreground">7 Day Return</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Seller Info & Product Details */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 order-1 lg:order-1">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs md:text-sm">
              <TabsTrigger value="details" className="px-2 md:px-4">Product Details</TabsTrigger>
              <TabsTrigger value="reviews" className="px-2 md:px-4">Reviews ({product.reviews})</TabsTrigger>
              <TabsTrigger value="shipping" className="px-2 md:px-4">Shipping Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span className="font-medium">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.user}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="shipping" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Domestic Shipping</h4>
                      <p className="text-muted-foreground">{product.shipping.domestic}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">International Shipping</h4>
                      <p className="text-muted-foreground">{product.shipping.international}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Seller Card */}
  <div className="order-2 lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 md:w-12 md:h-12">
                    <AvatarImage src={product.seller.avatar} />
                    <AvatarFallback>{product.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm md:text-base">{product.seller.name}</span>
                      {product.seller.verified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">{product.seller.location}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm">Seller Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs md:text-sm">{product.seller.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm">Total Sales</span>
                    <span className="text-xs md:text-sm">{product.seller.totalSales}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm">Member Since</span>
                    <span className="text-xs md:text-sm">{product.seller.memberSince}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full text-sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}