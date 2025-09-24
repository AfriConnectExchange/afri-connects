import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-8392ff4e/health", (c) => {
  return c.json({ status: "ok" });
});

// User signup with email
app.post("/make-server-8392ff4e/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role = 'buyer' } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format. Please use name@domain.com.' }, 400);
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return c.json({ 
        error: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.' 
      }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        role,
        profile_complete: false,
        free_access_expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 3 months
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return c.json({ error: 'This email is already registered. Please log in or reset your password.' }, 409);
      }
      console.log('Signup error:', error);
      return c.json({ error: 'Failed to create account' }, 500);
    }

    return c.json({ 
      message: 'Account created successfully',
      user: { id: data.user?.id, email: data.user?.email }
    });

  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Generate and send OTP for phone registration/login
app.post("/make-server-8392ff4e/auth/send-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { phone } = body;

    if (!phone) {
      return c.json({ error: 'Phone number is required' }, 400);
    }

    // Phone number validation (basic)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return c.json({ error: 'Invalid phone number format.' }, 400);
    }

    // Check OTP rate limiting
    const rateLimitKey = `otp_rate_limit:${phone}`;
    const attempts = await kv.get(rateLimitKey);
    if (attempts && parseInt(attempts) >= 5) {
      return c.json({ error: 'Too many OTP requests. Please try again in 1 hour.' }, 429);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5-minute expiry
    await kv.set(`otp:${phone}`, otp, { ttl: 300 });
    
    // Update rate limiting
    const currentAttempts = attempts ? parseInt(attempts) + 1 : 1;
    await kv.set(rateLimitKey, currentAttempts.toString(), { ttl: 3600 }); // 1 hour

    // In a real app, you would send SMS here
    console.log(`OTP for ${phone}: ${otp}`);
    
    return c.json({ 
      message: 'OTP sent successfully',
      // In development, return OTP for testing
      ...(Deno.env.get('NODE_ENV') === 'development' && { otp })
    });

  } catch (error) {
    console.log('Send OTP error:', error);
    return c.json({ error: 'Failed to send OTP' }, 500);
  }
});

// Verify OTP and register/login user
app.post("/make-server-8392ff4e/auth/verify-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, otp, name, isRegistration = false } = body;

    if (!phone || !otp) {
      return c.json({ error: 'Phone number and OTP are required' }, 400);
    }

    // Verify OTP
    const storedOtp = await kv.get(`otp:${phone}`);
    if (!storedOtp || storedOtp !== otp) {
      return c.json({ error: 'OTP is invalid or expired.' }, 400);
    }

    // Delete used OTP
    await kv.del(`otp:${phone}`);

    if (isRegistration) {
      // Create new user with phone
      if (!name) {
        return c.json({ error: 'Name is required for registration' }, 400);
      }

      const { data, error } = await supabase.auth.admin.createUser({
        phone,
        user_metadata: { 
          name,
          role: 'buyer',
          profile_complete: false,
          free_access_expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        phone_confirm: true
      });

      if (error) {
        console.log('Phone registration error:', error);
        return c.json({ error: 'Failed to create account' }, 500);
      }

      return c.json({ 
        message: 'Account created successfully',
        user: { id: data.user?.id, phone: data.user?.phone }
      });
    } else {
      // Login existing user
      // In a real implementation, you'd generate a session token here
      return c.json({ message: 'Login successful' });
    }

  } catch (error) {
    console.log('Verify OTP error:', error);
    return c.json({ error: 'Failed to verify OTP' }, 500);
  }
});

// Update user profile
app.put("/make-server-8392ff4e/users/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { name, phone, address, city, country, postal_code } = body;

    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone)) {
        return c.json({ error: 'Invalid phone number format' }, 400);
      }
    }

    // Update user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        name,
        phone,
        address,
        city,
        country,
        postal_code,
        profile_complete: !!(name && phone && address && city && country),
        updated_at: new Date().toISOString()
      }
    });

    if (updateError) {
      console.log('Profile update error:', updateError);
      return c.json({ error: 'Failed to update profile' }, 500);
    }

    return c.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Internal server error during profile update' }, 500);
  }
});

// Update user role
app.put("/make-server-8392ff4e/users/role", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { role } = body;

    const validRoles = ['buyer', 'seller', 'sme', 'trainer'];
    if (!validRoles.includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    // Check if role requires profile completion
    if ((role === 'seller' || role === 'sme' || role === 'trainer') && !user.user_metadata?.profile_complete) {
      return c.json({ error: 'This role requires profile completion before activation.' }, 400);
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role,
        updated_at: new Date().toISOString()
      }
    });

    if (updateError) {
      console.log('Role update error:', updateError);
      return c.json({ error: 'Failed to update role' }, 500);
    }

    return c.json({ message: 'Role updated successfully' });

  } catch (error) {
    console.log('Role update error:', error);
    return c.json({ error: 'Internal server error during role update' }, 500);
  }
});

// Update user preferences
app.put("/make-server-8392ff4e/users/preferences", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { language, timezone, notifications } = body;

    // Validate language
    const supportedLanguages = ['en', 'fr', 'sw', 'ha', 'am', 'ar'];
    if (language && !supportedLanguages.includes(language)) {
      return c.json({ error: 'Unsupported language.' }, 400);
    }

    // Validate timezone
    if (timezone && !timezone.match(/^GMT[+-]\d{1,2}$/)) {
      return c.json({ error: 'Invalid timezone format. Use GMT+/-N format.' }, 400);
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        preferences: {
          language: language || user.user_metadata?.preferences?.language || 'en',
          timezone: timezone || user.user_metadata?.preferences?.timezone || 'GMT+0',
          notifications: notifications || user.user_metadata?.preferences?.notifications || {
            email: true,
            sms: true,
            push: true
          }
        },
        updated_at: new Date().toISOString()
      }
    });

    if (updateError) {
      console.log('Preferences update error:', updateError);
      return c.json({ error: 'Failed to update preferences' }, 500);
    }

    return c.json({ message: 'Preferences updated successfully' });

  } catch (error) {
    console.log('Preferences update error:', error);
    return c.json({ error: 'Internal server error during preferences update' }, 500);
  }
});

// Deactivate account
app.post("/make-server-8392ff4e/users/deactivate", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Mark account as deactivated in user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        account_status: 'deactivated',
        deactivated_at: new Date().toISOString()
      }
    });

    if (updateError) {
      console.log('Account deactivation error:', updateError);
      return c.json({ error: 'Failed to deactivate account' }, 500);
    }

    return c.json({ message: 'Account deactivated successfully' });

  } catch (error) {
    console.log('Account deactivation error:', error);
    return c.json({ error: 'Internal server error during account deactivation' }, 500);
  }
});

// Delete account permanently
app.delete("/make-server-8392ff4e/users/delete", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { confirmation } = body;

    if (!confirmation) {
      return c.json({ error: 'Identity verification required to delete account.' }, 400);
    }

    // Delete user account
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.log('Account deletion error:', deleteError);
      return c.json({ error: 'Failed to delete account' }, 500);
    }

    return c.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.log('Account deletion error:', error);
    return c.json({ error: 'Internal server error during account deletion' }, 500);
  }
});

// Get user profile
app.get("/make-server-8392ff4e/users/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      metadata: user.user_metadata,
      created_at: user.created_at
    });

  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Internal server error while fetching profile' }, 500);
  }
});

// =============================================================================
// FR09 - RATINGS & REVIEWS APIs
// =============================================================================

// Submit product review
app.post("/make-server-8392ff4e/reviews/product", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { productId, rating, comment, verified_purchase = false } = body;

    if (!productId || !rating) {
      return c.json({ error: 'Product ID and rating are required' }, 400);
    }

    if (rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }

    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reviewData = {
      id: reviewId,
      product_id: productId,
      user_id: user.id,
      user_name: user.user_metadata?.name || 'Anonymous',
      rating,
      comment: comment || '',
      verified_purchase,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      helpful_count: 0,
      status: 'published'
    };

    await kv.set(`product_review:${reviewId}`, JSON.stringify(reviewData));
    
    // Update product average rating
    const productReviews = await kv.getByPrefix(`product_review:`);
    const productSpecificReviews = productReviews
      .map(r => JSON.parse(r))
      .filter(r => r.product_id === productId && r.status === 'published');
    
    const averageRating = productSpecificReviews.reduce((sum, r) => sum + r.rating, 0) / productSpecificReviews.length;
    
    await kv.set(`product_rating:${productId}`, JSON.stringify({
      product_id: productId,
      average_rating: averageRating,
      total_reviews: productSpecificReviews.length,
      rating_breakdown: {
        1: productSpecificReviews.filter(r => r.rating === 1).length,
        2: productSpecificReviews.filter(r => r.rating === 2).length,
        3: productSpecificReviews.filter(r => r.rating === 3).length,
        4: productSpecificReviews.filter(r => r.rating === 4).length,
        5: productSpecificReviews.filter(r => r.rating === 5).length,
      }
    }));

    return c.json({ 
      message: 'Review submitted successfully',
      review: reviewData
    });

  } catch (error) {
    console.log('Product review error:', error);
    return c.json({ error: 'Failed to submit review' }, 500);
  }
});

// Submit seller review
app.post("/make-server-8392ff4e/reviews/seller", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { sellerId, rating, comment, categories } = body;

    if (!sellerId || !rating) {
      return c.json({ error: 'Seller ID and rating are required' }, 400);
    }

    if (rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }

    const reviewId = `seller_review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reviewData = {
      id: reviewId,
      seller_id: sellerId,
      user_id: user.id,
      user_name: user.user_metadata?.name || 'Anonymous',
      rating,
      comment: comment || '',
      categories: categories || {
        communication: rating,
        shipping: rating,
        item_as_described: rating,
        overall: rating
      },
      created_at: new Date().toISOString(),
      status: 'published'
    };

    await kv.set(`seller_review:${reviewId}`, JSON.stringify(reviewData));

    // Update seller average rating
    const sellerReviews = await kv.getByPrefix(`seller_review:`);
    const sellerSpecificReviews = sellerReviews
      .map(r => JSON.parse(r))
      .filter(r => r.seller_id === sellerId && r.status === 'published');
    
    const averageRating = sellerSpecificReviews.reduce((sum, r) => sum + r.rating, 0) / sellerSpecificReviews.length;
    
    await kv.set(`seller_rating:${sellerId}`, JSON.stringify({
      seller_id: sellerId,
      average_rating: averageRating,
      total_reviews: sellerSpecificReviews.length,
      category_averages: {
        communication: sellerSpecificReviews.reduce((sum, r) => sum + r.categories.communication, 0) / sellerSpecificReviews.length,
        shipping: sellerSpecificReviews.reduce((sum, r) => sum + r.categories.shipping, 0) / sellerSpecificReviews.length,
        item_as_described: sellerSpecificReviews.reduce((sum, r) => sum + r.categories.item_as_described, 0) / sellerSpecificReviews.length,
      }
    }));

    return c.json({ 
      message: 'Seller review submitted successfully',
      review: reviewData
    });

  } catch (error) {
    console.log('Seller review error:', error);
    return c.json({ error: 'Failed to submit seller review' }, 500);
  }
});

// Seller response to review
app.post("/make-server-8392ff4e/reviews/reply", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { reviewId, response } = body;

    if (!reviewId || !response) {
      return c.json({ error: 'Review ID and response are required' }, 400);
    }

    // Check if user is the seller for this review
    const reviewData = await kv.get(`product_review:${reviewId}`) || await kv.get(`seller_review:${reviewId}`);
    if (!reviewData) {
      return c.json({ error: 'Review not found' }, 404);
    }

    const review = JSON.parse(reviewData);
    if (review.seller_id !== user.id && review.product_seller_id !== user.id) {
      return c.json({ error: 'Only the seller can respond to this review' }, 403);
    }

    const responseData = {
      id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      review_id: reviewId,
      seller_id: user.id,
      seller_name: user.user_metadata?.name || 'Seller',
      response,
      created_at: new Date().toISOString()
    };

    await kv.set(`review_response:${responseData.id}`, JSON.stringify(responseData));

    return c.json({ 
      message: 'Response submitted successfully',
      response: responseData
    });

  } catch (error) {
    console.log('Review response error:', error);
    return c.json({ error: 'Failed to submit response' }, 500);
  }
});

// Get product reviews
app.get("/make-server-8392ff4e/reviews/product/:productId", async (c) => {
  try {
    const productId = c.req.param('productId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');

    const allReviews = await kv.getByPrefix(`product_review:`);
    const productReviews = allReviews
      .map(r => JSON.parse(r))
      .filter(r => r.product_id === productId && r.status === 'published')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const startIndex = (page - 1) * limit;
    const paginatedReviews = productReviews.slice(startIndex, startIndex + limit);

    // Get responses for these reviews
    const responses = await kv.getByPrefix(`review_response:`);
    const reviewResponses = responses.map(r => JSON.parse(r));

    const reviewsWithResponses = paginatedReviews.map(review => ({
      ...review,
      responses: reviewResponses.filter(resp => resp.review_id === review.id)
    }));

    return c.json({
      reviews: reviewsWithResponses,
      pagination: {
        page,
        limit,
        total: productReviews.length,
        totalPages: Math.ceil(productReviews.length / limit)
      }
    });

  } catch (error) {
    console.log('Get product reviews error:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// =============================================================================
// FR10 - SECURITY & COMPLIANCE APIs
// =============================================================================

// Submit ID verification
app.post("/make-server-8392ff4e/security/verify-id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { id_type, id_number, document_images, selfie_image } = body;

    if (!id_type || !id_number || !document_images) {
      return c.json({ error: 'ID type, number, and document images are required' }, 400);
    }

    const verificationId = `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const verificationData = {
      id: verificationId,
      user_id: user.id,
      id_type,
      id_number: id_number.substring(0, 4) + '****' + id_number.substring(id_number.length - 4), // Mask ID number
      document_images, // In production, these would be encrypted
      selfie_image,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    await kv.set(`kyc_verification:${verificationId}`, JSON.stringify(verificationData));
    await kv.set(`user_kyc:${user.id}`, JSON.stringify({
      verification_id: verificationId,
      status: 'pending',
      submitted_at: new Date().toISOString()
    }));

    // Log security event
    await kv.set(`security_log:${Date.now()}`, JSON.stringify({
      event_type: 'kyc_submission',
      user_id: user.id,
      verification_id: verificationId,
      timestamp: new Date().toISOString(),
      ip_address: c.req.header('x-forwarded-for') || 'unknown'
    }));

    return c.json({ 
      message: 'ID verification submitted successfully',
      verification_id: verificationId,
      status: 'pending'
    });

  } catch (error) {
    console.log('ID verification error:', error);
    return c.json({ error: 'Failed to submit ID verification' }, 500);
  }
});

// Get verification status
app.get("/make-server-8392ff4e/security/verification-status", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userKyc = await kv.get(`user_kyc:${user.id}`);
    if (!userKyc) {
      return c.json({ status: 'not_submitted' });
    }

    const kycData = JSON.parse(userKyc);
    return c.json(kycData);

  } catch (error) {
    console.log('Get verification status error:', error);
    return c.json({ error: 'Failed to fetch verification status' }, 500);
  }
});

// Update privacy preferences
app.put("/make-server-8392ff4e/security/privacy", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { data_sharing, marketing_communications, profile_visibility, activity_visibility } = body;

    const privacySettings = {
      user_id: user.id,
      data_sharing: data_sharing || false,
      marketing_communications: marketing_communications || false,
      profile_visibility: profile_visibility || 'public',
      activity_visibility: activity_visibility || 'private',
      updated_at: new Date().toISOString()
    };

    await kv.set(`privacy_settings:${user.id}`, JSON.stringify(privacySettings));

    // Log privacy change
    await kv.set(`security_log:${Date.now()}`, JSON.stringify({
      event_type: 'privacy_update',
      user_id: user.id,
      changes: Object.keys(body),
      timestamp: new Date().toISOString()
    }));

    return c.json({ message: 'Privacy settings updated successfully' });

  } catch (error) {
    console.log('Privacy settings error:', error);
    return c.json({ error: 'Failed to update privacy settings' }, 500);
  }
});

// =============================================================================
// FR11 - ADMIN & MODERATION APIs
// =============================================================================

// Suspend user (Admin only)
app.post("/make-server-8392ff4e/admin/users/suspend", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const body = await c.req.json();
    const { userId, reason, duration } = body;

    if (!userId || !reason) {
      return c.json({ error: 'User ID and reason are required' }, 400);
    }

    const suspensionData = {
      user_id: userId,
      suspended_by: user.id,
      reason,
      duration: duration || 'indefinite',
      suspended_at: new Date().toISOString(),
      expires_at: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString() : null,
      status: 'active'
    };

    await kv.set(`user_suspension:${userId}`, JSON.stringify(suspensionData));

    // Update user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        account_status: 'suspended',
        suspension_reason: reason,
        suspended_at: new Date().toISOString()
      }
    });

    if (updateError) {
      console.log('User suspension error:', updateError);
      return c.json({ error: 'Failed to suspend user' }, 500);
    }

    // Log admin action
    await kv.set(`admin_log:${Date.now()}`, JSON.stringify({
      action: 'user_suspension',
      admin_id: user.id,
      target_user_id: userId,
      reason,
      timestamp: new Date().toISOString()
    }));

    return c.json({ message: 'User suspended successfully' });

  } catch (error) {
    console.log('User suspension error:', error);
    return c.json({ error: 'Failed to suspend user' }, 500);
  }
});

// Moderate review
app.put("/make-server-8392ff4e/admin/reviews/moderate", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const body = await c.req.json();
    const { reviewId, action, reason } = body;

    if (!reviewId || !action) {
      return c.json({ error: 'Review ID and action are required' }, 400);
    }

    const reviewData = await kv.get(`product_review:${reviewId}`) || await kv.get(`seller_review:${reviewId}`);
    if (!reviewData) {
      return c.json({ error: 'Review not found' }, 404);
    }

    const review = JSON.parse(reviewData);
    review.status = action; // 'approved', 'rejected', 'hidden'
    review.moderated_by = user.id;
    review.moderated_at = new Date().toISOString();
    review.moderation_reason = reason;

    const reviewKey = review.product_id ? `product_review:${reviewId}` : `seller_review:${reviewId}`;
    await kv.set(reviewKey, JSON.stringify(review));

    // Log moderation action
    await kv.set(`admin_log:${Date.now()}`, JSON.stringify({
      action: 'review_moderation',
      admin_id: user.id,
      review_id: reviewId,
      moderation_action: action,
      reason,
      timestamp: new Date().toISOString()
    }));

    return c.json({ message: 'Review moderated successfully' });

  } catch (error) {
    console.log('Review moderation error:', error);
    return c.json({ error: 'Failed to moderate review' }, 500);
  }
});

// Resolve escrow dispute
app.post("/make-server-8392ff4e/admin/escrow/resolve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const body = await c.req.json();
    const { disputeId, resolution, buyerRefund, sellerPayout, adminNotes } = body;

    if (!disputeId || !resolution) {
      return c.json({ error: 'Dispute ID and resolution are required' }, 400);
    }

    const resolutionData = {
      dispute_id: disputeId,
      resolved_by: user.id,
      resolution,
      buyer_refund: buyerRefund || 0,
      seller_payout: sellerPayout || 0,
      admin_notes: adminNotes || '',
      resolved_at: new Date().toISOString(),
      status: 'resolved'
    };

    await kv.set(`escrow_resolution:${disputeId}`, JSON.stringify(resolutionData));

    // Update dispute status
    const disputeData = await kv.get(`escrow_dispute:${disputeId}`);
    if (disputeData) {
      const dispute = JSON.parse(disputeData);
      dispute.status = 'resolved';
      dispute.resolved_at = new Date().toISOString();
      await kv.set(`escrow_dispute:${disputeId}`, JSON.stringify(dispute));
    }

    // Log admin action
    await kv.set(`admin_log:${Date.now()}`, JSON.stringify({
      action: 'escrow_resolution',
      admin_id: user.id,
      dispute_id: disputeId,
      resolution,
      timestamp: new Date().toISOString()
    }));

    return c.json({ 
      message: 'Dispute resolved successfully',
      resolution: resolutionData
    });

  } catch (error) {
    console.log('Escrow resolution error:', error);
    return c.json({ error: 'Failed to resolve dispute' }, 500);
  }
});

// =============================================================================
// FR12 - CUSTOMER CARE APIs
// =============================================================================

// Submit contact form
app.post("/make-server-8392ff4e/support/contact", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, subject, message, category, priority } = body;

    if (!name || !email || !subject || !message) {
      return c.json({ error: 'Name, email, subject, and message are required' }, 400);
    }

    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ticketData = {
      id: ticketId,
      name,
      email,
      subject,
      message,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: null,
      responses: []
    };

    await kv.set(`support_ticket:${ticketId}`, JSON.stringify(ticketData));

    return c.json({ 
      message: 'Support ticket created successfully',
      ticket_id: ticketId,
      status: 'open'
    });

  } catch (error) {
    console.log('Contact form error:', error);
    return c.json({ error: 'Failed to submit contact form' }, 500);
  }
});

// Chatbot interaction
app.post("/make-server-8392ff4e/support/chatbot", async (c) => {
  try {
    const body = await c.req.json();
    const { message, sessionId, userId } = body;

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Simple chatbot responses
    let botResponse = "I'm here to help! Let me connect you with the right information.";
    let actions = [];

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('tracking')) {
      botResponse = "I can help you track your order. Please provide your order number or visit the Order Tracking page.";
      actions = [{ type: 'navigate', label: 'Track Order', target: 'tracking' }];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('refund')) {
      botResponse = "For payment and refund issues, I can guide you through the process. Would you like to speak with a human agent?";
      actions = [{ type: 'escalate', label: 'Speak to Agent', target: 'payment_support' }];
    } else if (lowerMessage.includes('account') || lowerMessage.includes('profile')) {
      botResponse = "I can help with account settings. You can manage your profile, security settings, and preferences in your account section.";
      actions = [{ type: 'navigate', label: 'Go to Profile', target: 'profile' }];
    } else if (lowerMessage.includes('seller') || lowerMessage.includes('sell')) {
      botResponse = "Interested in selling? I can help you get started with seller verification and listing your first products.";
      actions = [{ type: 'navigate', label: 'Start Selling', target: 'kyc' }];
    }

    const chatData = {
      session_id: sessionId || `session_${Date.now()}`,
      user_id: userId,
      user_message: message,
      bot_response: botResponse,
      actions,
      timestamp: new Date().toISOString()
    };

    // Store chat interaction
    await kv.set(`chatbot_log:${Date.now()}`, JSON.stringify(chatData));

    return c.json({
      response: botResponse,
      actions,
      session_id: chatData.session_id
    });

  } catch (error) {
    console.log('Chatbot error:', error);
    return c.json({ error: 'Failed to process chatbot request' }, 500);
  }
});

// Escalate to live support
app.post("/make-server-8392ff4e/support/escalate", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    let user = null;
    
    if (accessToken) {
      const { data: { user: authUser } } = await supabase.auth.getUser(accessToken);
      user = authUser;
    }

    const body = await c.req.json();
    const { issue, category, urgency, contact_method, phone } = body;

    if (!issue || !category) {
      return c.json({ error: 'Issue description and category are required' }, 400);
    }

    const escalationId = `escalation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const escalationData = {
      id: escalationId,
      user_id: user?.id || null,
      user_email: user?.email || body.email,
      user_name: user?.user_metadata?.name || body.name,
      issue,
      category,
      urgency: urgency || 'medium',
      contact_method: contact_method || 'email',
      phone,
      status: 'pending',
      created_at: new Date().toISOString(),
      assigned_agent: null,
      estimated_response_time: '2-4 hours'
    };

    await kv.set(`support_escalation:${escalationId}`, JSON.stringify(escalationData));

    return c.json({ 
      message: 'Your request has been escalated to live support',
      escalation_id: escalationId,
      estimated_response_time: escalationData.estimated_response_time
    });

  } catch (error) {
    console.log('Support escalation error:', error);
    return c.json({ error: 'Failed to escalate to live support' }, 500);
  }
});

// =============================================================================
// FR13 - ORDER TRACKING APIs
// =============================================================================

// Create tracking record
app.post("/make-server-8392ff4e/orders/track/create", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { orderId, courierService, trackingNumber, estimatedDelivery } = body;

    if (!orderId || !courierService || !trackingNumber) {
      return c.json({ error: 'Order ID, courier service, and tracking number are required' }, 400);
    }

    const trackingData = {
      order_id: orderId,
      tracking_number: trackingNumber,
      courier_service: courierService,
      status: 'processing',
      estimated_delivery: estimatedDelivery,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tracking_history: [
        {
          status: 'processing',
          description: 'Order confirmed and processing',
          timestamp: new Date().toISOString(),
          location: 'Seller Location'
        }
      ]
    };

    await kv.set(`order_tracking:${orderId}`, JSON.stringify(trackingData));

    return c.json({ 
      message: 'Tracking record created successfully',
      tracking: trackingData
    });

  } catch (error) {
    console.log('Create tracking error:', error);
    return c.json({ error: 'Failed to create tracking record' }, 500);
  }
});

// Update tracking status
app.put("/make-server-8392ff4e/orders/track/update", async (c) => {
  try {
    const body = await c.req.json();
    const { orderId, status, location, description, courierUpdate } = body;

    if (!orderId || !status) {
      return c.json({ error: 'Order ID and status are required' }, 400);
    }

    const trackingData = await kv.get(`order_tracking:${orderId}`);
    if (!trackingData) {
      return c.json({ error: 'Tracking record not found' }, 404);
    }

    const tracking = JSON.parse(trackingData);
    tracking.status = status;
    tracking.updated_at = new Date().toISOString();

    // Add to tracking history
    tracking.tracking_history.push({
      status,
      description: description || `Order status updated to ${status}`,
      timestamp: new Date().toISOString(),
      location: location || 'In Transit',
      courier_update: courierUpdate || false
    });

    await kv.set(`order_tracking:${orderId}`, JSON.stringify(tracking));

    return c.json({ 
      message: 'Tracking updated successfully',
      tracking
    });

  } catch (error) {
    console.log('Update tracking error:', error);
    return c.json({ error: 'Failed to update tracking' }, 500);
  }
});

// Get tracking information
app.get("/make-server-8392ff4e/orders/track/:orderId", async (c) => {
  try {
    const orderId = c.req.param('orderId');
    
    const trackingData = await kv.get(`order_tracking:${orderId}`);
    if (!trackingData) {
      return c.json({ error: 'Tracking information not found' }, 404);
    }

    const tracking = JSON.parse(trackingData);
    return c.json({ tracking });

  } catch (error) {
    console.log('Get tracking error:', error);
    return c.json({ error: 'Failed to fetch tracking information' }, 500);
  }
});

// Get delivery updates for user
app.get("/make-server-8392ff4e/orders/delivery-updates", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all tracking records (in a real app, you'd filter by user's orders)
    const allTracking = await kv.getByPrefix(`order_tracking:`);
    const userOrders = allTracking
      .map(t => JSON.parse(t))
      .filter(t => {
        // In a real app, you'd have order ownership data
        return t.status !== 'delivered';
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return c.json({ 
      orders: userOrders,
      total: userOrders.length
    });

  } catch (error) {
    console.log('Get delivery updates error:', error);
    return c.json({ error: 'Failed to fetch delivery updates' }, 500);
  }
});

// Simulate courier integration webhook
app.post("/make-server-8392ff4e/orders/courier-webhook", async (c) => {
  try {
    const body = await c.req.json();
    const { tracking_number, status, location, timestamp, courier_service } = body;

    if (!tracking_number || !status) {
      return c.json({ error: 'Tracking number and status are required' }, 400);
    }

    // Find order by tracking number
    const allTracking = await kv.getByPrefix(`order_tracking:`);
    const matchingOrder = allTracking
      .map(t => ({ key: t, data: JSON.parse(t) }))
      .find(t => t.data.tracking_number === tracking_number);

    if (!matchingOrder) {
      return c.json({ error: 'Order not found for tracking number' }, 404);
    }

    const orderId = matchingOrder.data.order_id;
    const tracking = matchingOrder.data;

    // Update tracking with courier data
    tracking.status = status;
    tracking.updated_at = new Date().toISOString();
    tracking.tracking_history.push({
      status,
      description: `Courier update: ${status}`,
      timestamp: timestamp || new Date().toISOString(),
      location: location || 'Unknown',
      courier_update: true,
      courier_service
    });

    await kv.set(`order_tracking:${orderId}`, JSON.stringify(tracking));

    return c.json({ message: 'Courier update processed successfully' });

  } catch (error) {
    console.log('Courier webhook error:', error);
    return c.json({ error: 'Failed to process courier update' }, 500);
  }
});

Deno.serve(app.fetch);
