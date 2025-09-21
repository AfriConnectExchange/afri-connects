import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Star, MessageSquare, ThumbsUp, Flag, Search, Filter, User, 
  Calendar, Reply, MoreHorizontal, Edit, Trash2, Check, RefreshCw
} from 'lucide-react';
// import { useProductReviews, useReviewForm, useReplyToReview, useApiNotifications } from '../utils/api/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AnimatedButton } from './ui/animated-button';
import { CustomModal } from './ui/custom-modal';
import { CustomAlert } from './ui/custom-alert';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ReviewsPageProps {
  onNavigate: (page: string) => void;
}

// Mock data for demonstration
const mockReviews = [
  {
    id: 'rev-001',
    productName: 'Premium African Textiles',
    productImage: 'https://images.unsplash.com/photo-1594736797933-d0401ba2b013?w=100',
    rating: 5,
    review: 'Absolutely beautiful textiles! The quality exceeded my expectations and shipping was fast. The colors are vibrant and authentic. Will definitely order again.',
    author: 'Sarah M.',
    date: '2024-01-18',
    verified: true,
    helpful: 12,
    seller: 'African Heritage Co.',
    sellerReply: 'Thank you so much for your wonderful review! We\'re thrilled you love the textiles. We look forward to serving you again.',
    replyDate: '2024-01-19',
    canEdit: true
  },
  {
    id: 'rev-002',
    productName: 'Handcrafted Wooden Furniture',
    productImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100',
    rating: 4,
    review: 'Great craftsmanship and attention to detail. The delivery took a bit longer than expected, but the quality makes up for it.',
    author: 'Michael K.',
    date: '2024-01-15',
    verified: true,
    helpful: 8,
    seller: 'Artisan Woods Ltd.',
    sellerReply: null,
    replyDate: null,
    canEdit: false
  },
  {
    id: 'rev-003',
    productName: 'Organic Spice Collection',
    productImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100',
    rating: 5,
    review: 'Fresh, aromatic spices that transformed my cooking! Authentic flavors and excellent packaging.',
    author: 'Emma R.',
    date: '2024-01-12',
    verified: true,
    helpful: 15,
    seller: 'Spice Route Trading',
    sellerReply: 'We\'re so happy to hear you\'re enjoying our spices! Thank you for choosing us.',
    replyDate: '2024-01-13',
    canEdit: true
  }
];

const mockPendingReviews = [
  {
    id: 'pending-001',
    productName: 'Kente Cloth Collection',
    productImage: 'https://images.unsplash.com/photo-1594736797933-d0401ba2b013?w=100',
    purchaseDate: '2024-01-20',
    canReview: true
  },
  {
    id: 'pending-002',
    productName: 'Traditional Jewelry Set',
    productImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100',
    purchaseDate: '2024-01-19',
    canReview: true
  }
];

export function ReviewsPage({ onNavigate }: ReviewsPageProps) {
  const [activeTab, setActiveTab] = useState<'my-reviews' | 'pending' | 'received'>('my-reviews');
  const [showWriteReview, setShowWriteReview] = useState<string | null>(null);
  const [showReplyModal, setShowReplyModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string>('product-1'); // Default for demo
  
  // API hooks - temporarily disabled
  // const { data: reviewsData, loading: reviewsLoading, error: reviewsError, refetch } = useProductReviews(selectedProductId);
  // const reviewForm = useReviewForm('product');
  // const replyToReview = useReplyToReview();
  // const notifications = useApiNotifications();

  // Temporary mock state for reviews
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    loading: false
  });

  const [replyForm, setReplyForm] = useState({
    reply: ''
  });

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertState({ isOpen: true, type, title, message });
  };

  const handleSubmitReview = async () => {
    if (reviewForm.rating === 0 || reviewForm.comment.length < 20) {
      showAlert('error', 'Invalid Review', 'Please provide a rating and write at least 20 characters.');
      return;
    }

    if (!showWriteReview) return;

    // Simulate API call
    setReviewForm(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    showAlert('success', 'Review Submitted!', 'Your review has been posted and will help other buyers.');
    setShowWriteReview(null);
    setReviewForm({ rating: 0, comment: '', loading: false });
  };

  const handleSubmitReply = async () => {
    if (replyForm.reply.length < 10) {
      showAlert('error', 'Reply Too Short', 'Please write at least 10 characters.');
      return;
    }

    if (!showReplyModal) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showAlert('success', 'Reply Posted!', 'Your response has been added to the review.');
    setShowReplyModal(null);
    setReplyForm({ reply: '' });
  };

  // Use mock data for demo
  const displayReviews = mockReviews;
  
  const filteredReviews = displayReviews.filter((review: any) => {
    const matchesSearch = (review.productName || review.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (review.review || review.comment || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    interactive = false,
    size = 'sm' 
  }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void;
    interactive?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star 
              className={`${sizeClasses[size]} ${
                star <= (interactive ? (hoverRating || rating) : rating)
                  ? 'fill-primary text-primary' 
                  : 'text-muted-foreground'
              }`} 
            />
          </button>
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: any }) => (
    <Card className="bg-white border border-border">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <ImageWithFallback
              src={review.productImage || ''}
              alt={review.productName || 'Product'}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-foreground">{review.productName || review.product_name || 'Product'}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <StarRating rating={review.rating || 0} />
                  <span className="text-sm text-muted-foreground">
                    by {review.author || review.user_name || 'Anonymous'}
                  </span>
                  {review.verified && (
                    <Badge variant="outline" className="text-xs bg-white text-primary border-border">
                      Verified Purchase
                    </Badge>
                  )}
                </div>
              </div>
              
              {review.canEdit && (
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-sm text-foreground leading-relaxed">{review.review || review.comment || ''}</p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{review.date ? new Date(review.date).toLocaleDateString() : 'Unknown date'}</span>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{review.helpful || 0}</span>
                </button>
                <button className="hover:text-primary transition-colors">
                  <Flag className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Seller Reply */}
            {review.sellerReply && (
              <div className="mt-4 p-3 bg-muted/20 rounded-lg border-l-2 border-primary">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-medium text-primary">{review.seller || 'Seller'}</span>
                  <span className="text-xs text-muted-foreground">
                    {review.replyDate ? new Date(review.replyDate).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
                <p className="text-sm text-foreground">{review.sellerReply}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Reviews & Ratings</h1>
              <p className="text-muted-foreground">Share your experiences and help the community</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-fit grid-cols-3 mb-8">
              <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
              <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
              <TabsTrigger value="received">Received Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="my-reviews">
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search your reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {filteredReviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ReviewCard review={review} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="space-y-4">
                {mockPendingReviews.length === 0 ? (
                  <Card className="bg-white border border-border">
                    <CardContent className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No pending reviews</h3>
                      <p className="text-muted-foreground">You're all caught up! Purchase items to leave reviews.</p>
                    </CardContent>
                  </Card>
                ) : (
                  mockPendingReviews.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white border border-border">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                <ImageWithFallback
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-medium text-foreground">{item.productName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Purchased on {new Date(item.purchaseDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <AnimatedButton
                              onClick={() => setShowWriteReview(item.id)}
                              size="sm"
                              className="gap-2"
                            >
                              <Star className="w-4 h-4" />
                              Write Review
                            </AnimatedButton>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="received">
              <Card className="bg-white border border-border">
                <CardContent className="text-center py-12">
                  <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Seller Reviews</h3>
                  <p className="text-muted-foreground">Reviews received for your products will appear here once you become a seller.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Write Review Modal */}
      <CustomModal
        isOpen={!!showWriteReview}
        onClose={() => setShowWriteReview(null)}
        title="Write a Review"
        description="Share your experience to help other buyers"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Your Rating</Label>
            <div className="flex items-center space-x-3">
              <StarRating 
                rating={reviewForm.rating} 
                onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
                interactive
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {reviewForm.rating > 0 && (
                  reviewForm.rating === 5 ? 'Excellent' :
                  reviewForm.rating === 4 ? 'Good' :
                  reviewForm.rating === 3 ? 'Average' :
                  reviewForm.rating === 2 ? 'Poor' : 'Terrible'
                )}
              </span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Your Review</Label>
            <Textarea
              placeholder="Tell others about your experience with this product..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reviewForm.comment.length}/500 characters (minimum 20)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <AnimatedButton
              onClick={handleSubmitReview}
              className="flex-1"
              disabled={reviewForm.rating === 0 || reviewForm.comment.length < 20 || reviewForm.loading}
            >
              {reviewForm.loading ? 'Submitting...' : 'Submit Review'}
            </AnimatedButton>
            <Button
              variant="outline"
              onClick={() => setShowWriteReview(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* Reply Modal */}
      <CustomModal
        isOpen={!!showReplyModal}
        onClose={() => setShowReplyModal(null)}
        title="Reply to Review"
        description="Respond to customer feedback professionally"
        size="md"
      >
        <div className="space-y-4">
          <Textarea
            placeholder="Write your response to this review..."
            value={replyForm.reply}
            onChange={(e) => setReplyForm(prev => ({ ...prev, reply: e.target.value }))}
            className="min-h-[100px]"
          />
          
          <div className="flex gap-3 pt-4">
            <AnimatedButton
              onClick={handleSubmitReply}
              className="flex-1"
              disabled={replyForm.reply.length < 10}
            >
              Post Reply
            </AnimatedButton>
            <Button
              variant="outline"
              onClick={() => setShowReplyModal(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        autoClose={alertState.type === 'success'}
      />
    </div>
  );
}