/**
 * API Integration Examples
 * Demonstrates how to use the new AfriConnect APIs
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Star, MessageSquare, Shield, Users, Headphones, Truck, 
  CheckCircle, XCircle, AlertCircle, Loader2 
} from 'lucide-react';

// Import our API hooks
import { 
  useSubmitProductReview, 
  useKycVerification,
  useChatbot,
  useOrderTracking,
  useAdminDashboard
} from '../../utils/api/hooks';

export function ApiExamples() {
  const [activeExample, setActiveExample] = useState<string>('reviews');

  // Example 1: Product Reviews
  const ReviewExample = () => {
    const [productId, setProductId] = useState('product-123');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('Great product! Highly recommended.');
    
    const submitReview = useSubmitProductReview();

    const handleSubmit = async () => {
      await submitReview.mutate({
        productId,
        rating,
        comment,
        verified_purchase: true
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Product Review API
          </CardTitle>
          <CardDescription>Submit and manage product reviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Product ID</label>
            <Input 
              value={productId} 
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter product ID"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star 
                    className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Review Comment</label>
            <Textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review..."
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={submitReview.loading}
            className="w-full"
          >
            {submitReview.loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>

          {submitReview.data && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">✅ Review submitted successfully!</p>
            </div>
          )}

          {submitReview.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">❌ Error: {submitReview.error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Example 2: KYC Verification
  const KycExample = () => {
    const kycProcess = useKycVerification();

    const handleNextStep = () => {
      kycProcess.nextStep();
    };

    const handleSubmitKyc = async () => {
      await kycProcess.submitKyc();
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            KYC Verification API
          </CardTitle>
          <CardDescription>ID verification and compliance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Step:</span>
            <Badge variant="outline">{kycProcess.step}/4</Badge>
          </div>

          {kycProcess.step === 1 && (
            <div>
              <label className="text-sm font-medium">ID Type</label>
              <Input 
                value={kycProcess.verificationData.id_type}
                onChange={(e) => kycProcess.updateVerificationData('id_type', e.target.value)}
                placeholder="e.g., passport, driving_license"
              />
            </div>
          )}

          {kycProcess.step === 2 && (
            <div>
              <label className="text-sm font-medium">ID Number</label>
              <Input 
                value={kycProcess.verificationData.id_number}
                onChange={(e) => kycProcess.updateVerificationData('id_number', e.target.value)}
                placeholder="Enter ID number"
              />
            </div>
          )}

          <div className="flex gap-2">
            {kycProcess.step > 1 && (
              <Button variant="outline" onClick={kycProcess.prevStep}>
                Previous
              </Button>
            )}
            
            {kycProcess.step < 4 ? (
              <Button onClick={handleNextStep} className="flex-1">
                Next Step
              </Button>
            ) : (
              <Button 
                onClick={handleSubmitKyc} 
                disabled={kycProcess.loading}
                className="flex-1"
              >
                {kycProcess.loading ? 'Submitting...' : 'Submit Verification'}
              </Button>
            )}
          </div>

          {kycProcess.status && typeof kycProcess.status === 'object' && 'status' in kycProcess.status && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Status: {(kycProcess.status as { status: string }).status}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Example 3: Chatbot Integration
  const ChatbotExample = () => {
    const [message, setMessage] = useState('');
    const chatbot = useChatbot();

    const handleSendMessage = async () => {
      if (message.trim()) {
        await chatbot.sendMessage(message);
        setMessage('');
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5" />
            Customer Support Chatbot
          </CardTitle>
          <CardDescription>AI-powered customer support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-48 border rounded-md p-3 overflow-y-auto bg-gray-50">
            {chatbot.messages.length === 0 ? (
              <p className="text-sm text-gray-500">Start a conversation...</p>
            ) : (
              <div className="space-y-2">
                {chatbot.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-md text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-blue-100 ml-6' 
                        : 'bg-white mr-6'
                    }`}
                  >
                    <strong>{msg.sender === 'user' ? 'You' : 'Assistant'}:</strong> {msg.text}
                    
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 space-x-2">
                        {msg.actions.map((action, idx) => (
                          <Button key={idx} size="sm" variant="outline">
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>

          {chatbot.messages.length > 0 && (
            <Button variant="outline" onClick={chatbot.clearChat} size="sm">
              Clear Chat
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  // Example 4: Order Tracking
  const TrackingExample = () => {
    const [orderId, setOrderId] = useState('order-12345');
    const orderTracking = useOrderTracking(orderId);

    const handleAddUpdate = async () => {
      await orderTracking.addTrackingUpdate({
        status: 'in_transit',
        location: 'Distribution Center',
        description: 'Package is on its way'
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Order Tracking API
          </CardTitle>
          <CardDescription>Real-time delivery tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Order ID</label>
            <Input 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter order ID"
            />
          </div>

          {orderTracking.trackingInfo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge>{orderTracking.trackingInfo.status}</Badge>
              </div>
              
              <div>
                <span className="text-sm font-medium">Tracking History:</span>
                <div className="mt-2 space-y-1">
                  {orderTracking.trackingHistory.map((event: any, idx: number) => (
                    <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="font-medium">{event.status}</div>
                      <div className="text-gray-600">{event.description}</div>
                      <div className="text-gray-500">{new Date(event.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleAddUpdate} disabled={orderTracking.loading}>
            Add Tracking Update
          </Button>

          {orderTracking.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">Error: {orderTracking.error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Example 5: Admin Actions
  const AdminExample = () => {
    const [userId, setUserId] = useState('user-123');
    const [reason, setReason] = useState('Violation of terms');
    const adminDashboard = useAdminDashboard();

    const handleSuspendUser = async () => {
      await adminDashboard.performAction('suspend_user', {
        userId,
        reason,
        duration: 30
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Moderation API
          </CardTitle>
          <CardDescription>Administrative actions and moderation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">User ID</label>
            <Input 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Reason</label>
            <Textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for action..."
            />
          </div>

          <Button 
            onClick={handleSuspendUser}
            disabled={adminDashboard.loading}
            variant="destructive"
            className="w-full"
          >
            {adminDashboard.loading ? 'Processing...' : 'Suspend User'}
          </Button>

          {adminDashboard.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">Error: {adminDashboard.error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const examples = [
    { id: 'reviews', label: 'Reviews API', icon: Star, component: ReviewExample },
    { id: 'kyc', label: 'KYC API', icon: Shield, component: KycExample },
    { id: 'chatbot', label: 'Support API', icon: Headphones, component: ChatbotExample },
    { id: 'tracking', label: 'Tracking API', icon: Truck, component: TrackingExample },
    { id: 'admin', label: 'Admin API', icon: Users, component: AdminExample },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">AfriConnect API Examples</h1>
          <p className="text-muted-foreground">Interactive demonstrations of the backend APIs</p>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8">
          {examples.map((example) => {
            const IconComponent = example.icon;
            return (
              <Button
                key={example.id}
                variant={activeExample === example.id ? 'default' : 'outline'}
                onClick={() => setActiveExample(example.id)}
                className="flex flex-col gap-2 h-auto py-4"
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs">{example.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Active Example */}
        <motion.div
          key={activeExample}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            const activeExampleData = examples.find(ex => ex.id === activeExample);
            const ComponentToRender = activeExampleData?.component;
            return ComponentToRender ? <ComponentToRender /> : null;
          })()}
        </motion.div>

        {/* API Status Indicators */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-3">API Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Reviews API</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Security API</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Admin API</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Support API</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Tracking API</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}