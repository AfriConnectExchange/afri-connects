import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, ArrowLeft, ChevronRight, BookOpen, MessageSquare, 
  Phone, Mail, ExternalLink, Star, ThumbsUp, ThumbsDown,
  HelpCircle, CreditCard, Shield, Truck, User, ShoppingCart,
  AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Alert, AlertDescription } from './ui/alert';
import { AnimatedButton } from './ui/animated-button';

interface HelpCenterPageProps {
  onNavigate: (page: string) => void;
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  articleCount: number;
  color: string;
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  featured?: boolean;
}

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'New to AfriConnect? Start here for the basics',
    icon: BookOpen,
    articleCount: 12,
    color: 'text-blue-600 bg-blue-100'
  },
  {
    id: 'account',
    name: 'Account & Profile',
    description: 'Managing your account, profile, and preferences',
    icon: User,
    articleCount: 8,
    color: 'text-green-600 bg-green-100'
  },
  {
    id: 'buying',
    name: 'Buying & Shopping',
    description: 'How to find products, add to cart, and checkout',
    icon: ShoppingCart,
    articleCount: 15,
    color: 'text-purple-600 bg-purple-100'
  },
  {
    id: 'payments',
    name: 'Payments & Billing',
    description: 'Payment methods, escrow, and transaction issues',
    icon: CreditCard,
    articleCount: 10,
    color: 'text-orange-600 bg-orange-100'
  },
  {
    id: 'shipping',
    name: 'Shipping & Delivery',
    description: 'Tracking orders, delivery times, and shipping issues',
    icon: Truck,
    articleCount: 9,
    color: 'text-indigo-600 bg-indigo-100'
  },
  {
    id: 'security',
    name: 'Security & Trust',
    description: 'KYC verification, seller trust, and safety tips',
    icon: Shield,
    articleCount: 7,
    color: 'text-red-600 bg-red-100'
  }
];

const helpArticles: HelpArticle[] = [
  // Getting Started
  {
    id: '1',
    title: 'How to create your AfriConnect account',
    content: `Creating your AfriConnect account is quick and easy:

1. **Visit the Registration Page**: Click "Sign Up" on the homepage
2. **Choose Registration Method**: You can register with email or phone number
3. **Email Registration**: Enter your email and create a strong password
4. **Phone Registration**: Enter your phone number and verify with OTP
5. **Complete Your Profile**: Add your name, location, and preferences
6. **Start Exploring**: Browse our marketplace and discover amazing products!

**Tips for a Strong Password:**
- Use at least 8 characters
- Include uppercase, lowercase, numbers, and special characters
- Avoid using personal information like birthdays or names

**Verification Process:**
- Email users will receive a verification link valid for 24 hours
- Phone users will receive a 6-digit OTP valid for 5 minutes
- Your account will be active immediately after verification`,
    category: 'getting-started',
    tags: ['registration', 'signup', 'account creation', 'verification'],
    helpful: 89,
    notHelpful: 3,
    lastUpdated: '2024-01-20',
    featured: true
  },
  {
    id: '2',
    title: 'Understanding the AfriConnect marketplace',
    content: `AfriConnect is your gateway to authentic African products and services:

**What You'll Find:**
- Traditional crafts and textiles
- African fashion and jewelry
- Beauty and wellness products
- Home decor and furniture
- Food and beverages
- Art and collectibles

**Key Features:**
- **Verified Sellers**: All sellers complete KYC verification
- **Secure Payments**: Multiple payment options including escrow
- **Global Shipping**: Delivery to over 50 countries
- **Quality Assurance**: Only authentic, high-quality products
- **Community Reviews**: Real feedback from verified buyers

**Getting Started:**
1. Use the search bar to find specific products
2. Browse by categories to discover new items
3. Check seller verification badges
4. Read reviews and ratings before purchasing
5. Use filters to narrow down your search

**Special Features:**
- **Free Listings**: Find free items shared by community members
- **Courses**: Learn new skills from African experts
- **Money Transfer**: Send money to family and friends across Africa`,
    category: 'getting-started',
    tags: ['marketplace', 'overview', 'features', 'products'],
    helpful: 156,
    notHelpful: 8,
    lastUpdated: '2024-01-18',
    featured: true
  },
  // Account & Profile
  {
    id: '3',
    title: 'How to complete your profile',
    content: `A complete profile helps you get the most out of AfriConnect:

**Personal Information:**
- Full name (required)
- Profile picture (optional, max 2MB)
- Phone number (for order updates)
- Email address (for notifications)

**Address Information:**
- Country and city
- Full postal address (for deliveries)
- Preferred language and timezone

**Preferences:**
- Notification settings (email, SMS, push)
- Privacy settings
- Currency preferences

**For Sellers (Additional Requirements):**
- Business information
- KYC verification documents
- Bank account details for payments
- Tax information if applicable

**Profile Completion Benefits:**
- Access to all platform features
- Better customer service
- Faster checkout process
- Personalized recommendations
- Trust badges for verified profiles`,
    category: 'account',
    tags: ['profile', 'personal information', 'settings', 'verification'],
    helpful: 73,
    notHelpful: 2,
    lastUpdated: '2024-01-19'
  },
  // Buying & Shopping
  {
    id: '4',
    title: 'How to search and filter products',
    content: `Find exactly what you're looking for with our powerful search tools:

**Search Methods:**
- **Keyword Search**: Enter product names, descriptions, or seller names
- **Category Browse**: Explore products by category
- **Visual Search**: Upload images to find similar products

**Search Tips:**
- Use at least 3 characters for best results
- Try different spellings or synonyms
- Use specific terms for better results

**Filtering Options:**
- **Price Range**: Set minimum and maximum prices
- **Location**: Filter by seller location
- **Condition**: New, like-new, good, or fair
- **Shipping**: Free shipping, paid shipping, or pickup only
- **Seller Type**: Verified sellers only
- **Special Offers**: On sale, featured, or free listings

**Sorting Options:**
- Most relevant (default)
- Price: Low to high
- Price: High to low
- Newest first
- Best rated
- Most popular

**Advanced Features:**
- Save searches for later
- Set up alerts for new listings
- Compare similar products
- View seller profiles and ratings`,
    category: 'buying',
    tags: ['search', 'filters', 'products', 'categories'],
    helpful: 94,
    notHelpful: 5,
    lastUpdated: '2024-01-21',
    featured: true
  },
  // Payments
  {
    id: '5',
    title: 'Understanding escrow payments',
    content: `Escrow payments provide security for both buyers and sellers:

**How Escrow Works:**
1. **Buyer pays**: Money is held securely by AfriConnect
2. **Seller ships**: Item is sent to buyer
3. **Buyer confirms**: Delivery is confirmed by buyer
4. **Payment released**: Money is transferred to seller

**Benefits for Buyers:**
- Money protected until delivery confirmed
- Easy dispute resolution process
- Full refund if item not received
- Quality guarantee protection

**Benefits for Sellers:**
- Payment guaranteed once shipped
- Protection against false claims
- Professional dispute mediation
- Faster payment processing

**When to Use Escrow:**
- High-value purchases (recommended for £100+)
- International transactions
- New or unverified sellers
- Custom or made-to-order items

**Escrow Timeline:**
- Funds held: Until delivery confirmed
- Auto-release: 7 days after delivery (if no disputes)
- Dispute window: 14 days from delivery
- Resolution time: 3-5 business days

**Fees:**
- Buyer: No additional fees
- Seller: 2.5% of transaction value
- Currency conversion: Market rates apply`,
    category: 'payments',
    tags: ['escrow', 'payment security', 'buyer protection', 'disputes'],
    helpful: 127,
    notHelpful: 7,
    lastUpdated: '2024-01-17',
    featured: true
  },
  // Security
  {
    id: '6',
    title: 'How to verify seller authenticity',
    content: `Stay safe by learning to identify verified and trustworthy sellers:

**Verification Badges:**
- **KYC Verified**: Seller has completed identity verification
- **Address Verified**: Seller's business address confirmed
- **Phone Verified**: Phone number confirmed via SMS
- **Email Verified**: Email address confirmed

**Seller Rating System:**
- ⭐⭐⭐⭐⭐ 5 stars: Excellent (96-100% positive)
- ⭐⭐⭐⭐ 4 stars: Very Good (91-95% positive)
- ⭐⭐⭐ 3 stars: Good (81-90% positive)
- ⭐⭐ 2 stars: Fair (71-80% positive)
- ⭐ 1 star: Poor (Below 70% positive)

**Red Flags to Watch:**
- ❌ No verification badges
- ❌ Very low prices (too good to be true)
- ❌ Poor communication or grammar
- ❌ Requests for payment outside platform
- ❌ No customer reviews or ratings
- ❌ Reluctant to provide additional photos

**Green Flags (Good Signs):**
- ✅ Multiple verification badges
- ✅ High rating with many reviews
- ✅ Detailed product descriptions
- ✅ Multiple clear product photos
- ✅ Quick response to messages
- ✅ Professional communication

**Additional Safety Tips:**
- Always use platform payment methods
- Read all reviews, not just the star rating
- Ask questions before purchasing
- Report suspicious activity to our team
- Use escrow for high-value purchases
- Trust your instincts - if something feels wrong, don't proceed`,
    category: 'security',
    tags: ['seller verification', 'safety', 'trust badges', 'red flags'],
    helpful: 89,
    notHelpful: 4,
    lastUpdated: '2024-01-16'
  }
];

const quickActions = [
  {
    title: 'Contact Support',
    description: 'Get help from our support team',
    icon: MessageSquare,
    action: 'support'
  },
  {
    title: 'Track Your Order',
    description: 'Check the status of your purchases',
    icon: Truck,
    action: 'tracking'
  },
  {
    title: 'Manage Account',
    description: 'Update your profile and settings',
    icon: User,
    action: 'profile'
  },
  {
    title: 'Report an Issue',
    description: 'Report problems or suspicious activity',
    icon: AlertCircle,
    action: 'support'
  }
];

export function HelpCenterPage({ onNavigate }: HelpCenterPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [articleFeedback, setArticleFeedback] = useState<Record<string, 'up' | 'down' | null>>({});

  // Filter and search articles
  const filteredArticles = useMemo(() => {
    let filtered = helpArticles;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const featuredArticles = helpArticles.filter(article => article.featured);

  const handleArticleFeedback = (articleId: string, feedback: 'up' | 'down') => {
    setArticleFeedback(prev => ({
      ...prev,
      [articleId]: prev[articleId] === feedback ? null : feedback
    }));
  };

  const handleQuickAction = (action: string) => {
    onNavigate(action);
  };

  // If viewing a specific article
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Help Center
              </Button>
              <div>
                <h1 className="font-bold text-foreground">{selectedArticle.title}</h1>
                <p className="text-muted-foreground">
                  Last updated: {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-8">
                  <div className="prose prose-gray max-w-none">
                    {selectedArticle.content.split('\n\n').map((paragraph, index) => {
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return (
                          <h3 key={index} className="font-semibold text-foreground mt-6 mb-3">
                            {paragraph.replace(/\*\*/g, '')}
                          </h3>
                        );
                      } else if (paragraph.includes('- **') || paragraph.includes('- ✅') || paragraph.includes('- ❌')) {
                        return (
                          <div key={index} className="my-4">
                            {paragraph.split('\n').map((line, lineIndex) => (
                              <div key={lineIndex} className="mb-2">
                                {line.replace(/\*\*/g, '')}
                              </div>
                            ))}
                          </div>
                        );
                      } else if (paragraph.match(/^\d+\./)) {
                        return (
                          <div key={index} className="my-4">
                            {paragraph.split('\n').map((line, lineIndex) => (
                              <div key={lineIndex} className="mb-2">
                                {line.replace(/\*\*/g, '')}
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        return (
                          <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                            {paragraph.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                    })}
                  </div>

                  <Separator className="my-8" />

                  {/* Article Feedback */}
                  <div className="text-center">
                    <h4 className="font-medium mb-4">Was this article helpful?</h4>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant={articleFeedback[selectedArticle.id] === 'up' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleArticleFeedback(selectedArticle.id, 'up')}
                        className="gap-2"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Yes ({selectedArticle.helpful})
                      </Button>
                      <Button
                        variant={articleFeedback[selectedArticle.id] === 'down' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleArticleFeedback(selectedArticle.id, 'down')}
                        className="gap-2"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        No ({selectedArticle.notHelpful})
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Still need help? <Button variant="link" className="p-0 h-auto" onClick={() => onNavigate('support')}>Contact our support team</Button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="font-bold text-foreground">Help Center</h1>
              <p className="text-muted-foreground">Find answers and get support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="font-semibold mb-2">How can we help you?</h2>
                  <p className="text-muted-foreground">Search our knowledge base or browse categories below</p>
                </div>
                <div className="relative max-w-lg mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-4 text-center" onClick={() => handleQuickAction(action.action)}>
                      <action.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h4 className="font-medium mb-1">{action.title}</h4>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse by Category</TabsTrigger>
              <TabsTrigger value="articles">
                {searchQuery || selectedCategory ? 'Search Results' : 'Featured Articles'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              {/* Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {helpCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 h-full">
                      <CardContent 
                        className="p-6"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          // Switch to articles tab when category is selected
                          document.querySelector('[value="articles"]')?.click();
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                            <category.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{category.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {category.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {category.articleCount} articles
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="articles" className="space-y-6">
              {/* Category Filter */}
              {selectedCategory && (
                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      Showing articles in: <strong>
                        {helpCategories.find(c => c.id === selectedCategory)?.name}
                      </strong>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Clear Filter
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Articles List */}
              {filteredArticles.length > 0 ? (
                <div className="space-y-4">
                  {filteredArticles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-6" onClick={() => setSelectedArticle(article)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{article.title}</h3>
                                {article.featured && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {article.content.substring(0, 150)}...
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Updated {new Date(article.lastUpdated).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {article.helpful} helpful
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {helpCategories.find(c => c.id === article.category)?.name}
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground ml-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No articles found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery 
                        ? `No articles match "${searchQuery}". Try different keywords or browse by category.`
                        : 'No articles available in this category.'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {searchQuery && (
                        <Button variant="outline" onClick={() => setSearchQuery('')}>
                          Clear Search
                        </Button>
                      )}
                      <AnimatedButton onClick={() => onNavigate('support')}>
                        Contact Support
                      </AnimatedButton>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Still Need Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="font-semibold mb-4">Still need help?</h3>
                <p className="text-muted-foreground mb-6">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <AnimatedButton
                    onClick={() => onNavigate('support')}
                    className="gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Contact Support
                  </AnimatedButton>
                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Email Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}