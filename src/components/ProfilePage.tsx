import { useState, useEffect } from 'react';
import { ArrowLeft, User, Camera, Mail, Phone, MapPin, Loader2, AlertCircle, Shield, Settings, LogOut, Receipt } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { LogoutConfirmation, AccountDeletionConfirmation, ConfirmationModal } from './ui/confirmation-modal';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../utils/auth/context';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  metadata: {
    name?: string;
    role?: string;
    profile_complete?: boolean;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    preferences?: {
      language?: string;
      timezone?: string;
      notifications?: {
        email: boolean;
        sms: boolean;
        push: boolean;
      };
    };
    free_access_expiry?: string;
  };
  created_at: string;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, session, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    role: '',
    language: 'en',
    timezone: 'GMT+0',
    notifications: {
      email: true,
      sms: true,
      push: true
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (!session?.access_token) {
        onNavigate('auth');
        return;
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8392ff4e/users/profile`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const profileData = await response.json();
      setProfile(profileData);
      
      // Set form data
      setFormData({
        name: profileData.metadata?.name || '',
        phone: profileData.phone || '',
        address: profileData.metadata?.address || '',
        city: profileData.metadata?.city || '',
        country: profileData.metadata?.country || '',
        postal_code: profileData.metadata?.postal_code || '',
        role: profileData.metadata?.role || 'buyer',
        language: profileData.metadata?.preferences?.language || 'en',
        timezone: profileData.metadata?.preferences?.timezone || 'GMT+0',
        notifications: {
          email: profileData.metadata?.preferences?.notifications?.email ?? true,
          sms: profileData.metadata?.preferences?.notifications?.sms ?? true,
          push: profileData.metadata?.preferences?.notifications?.push ?? true,
        }
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
    setError('');
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (!session?.access_token) {
        throw new Error('Session expired. Please log in again.');
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8392ff4e/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postal_code: formData.postal_code
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      await loadProfile(); // Reload profile data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateRole = async () => {
    setIsSaving(true);
    setError('');

    try {
      if (!session?.access_token) {
        throw new Error('Session expired. Please log in again.');
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8392ff4e/users/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          role: formData.role
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      setSuccess('Role updated successfully');
      await loadProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreferences = async () => {
    setIsSaving(true);
    setError('');

    try {
      if (!session?.access_token) {
        throw new Error('Session expired. Please log in again.');
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8392ff4e/users/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          language: formData.language,
          timezone: formData.timezone,
          notifications: formData.notifications
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update preferences');
      }

      setSuccess('Preferences updated successfully');
      await loadProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateAccount = () => {
    setShowDeactivateConfirm(true);
  };

  const confirmDeactivateAccount = async () => {
    setIsSaving(true);
    setError('');

    try {
      if (!session?.access_token) {
        throw new Error('Session expired. Please log in again.');
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8392ff4e/users/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to deactivate account');
      }

      setSuccess('Account deactivated successfully');
      setShowDeactivateConfirm(false);
      await signOut();
      onNavigate('home');
    } catch (err: any) {
      setError(err.message);
      setShowDeactivateConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== 'delete') {
      setError('Please type "DELETE" to confirm account deletion');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (!session?.access_token) {
        throw new Error('Session expired. Please log in again.');
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8392ff4e/users/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          confirmation: true
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      setSuccess('Account deleted successfully');
      await signOut();
      onNavigate('home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = async () => {
    await signOut();
    setShowLogoutConfirm(false);
    onNavigate('home');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    setIsSaving(true);
    setError('');

    try {
      if (!session?.access_token) {
        throw new Error('Session expired. Please log in again.');
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8392ff4e/users/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          confirmation: true
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      setSuccess('Account deleted successfully');
      setShowDeleteConfirm(false);
      await signOut();
      onNavigate('home');
    } catch (err: any) {
      setError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'seller': return 'bg-blue-100 text-blue-800';
      case 'sme': return 'bg-purple-100 text-purple-800';
      case 'trainer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'sme': return 'SME Business';
      case 'trainer': return 'Trainer/Educator';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load your profile. Please try signing in again.
            </p>
            <Button onClick={() => onNavigate('auth')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Summary */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {profile.metadata?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg mb-1">
                  {profile.metadata?.name || 'Unnamed User'}
                </h3>
                <Badge className={`mb-3 ${getRoleColor(profile.metadata?.role || 'buyer')}`}>
                  {getRoleLabel(profile.metadata?.role || 'buyer')}
                </Badge>
                <div className="text-sm text-muted-foreground space-y-1">
                  {profile.email && (
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {formData.city && formData.country && (
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{formData.city}, {formData.country}</span>
                    </div>
                  )}
                </div>
                
                {profile.metadata?.free_access_expiry && (
                  <div className="mt-4 p-3 bg-accent rounded-lg">
                    <p className="text-sm font-medium">Free Access</p>
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(profile.metadata.free_access_expiry).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onNavigate('transactions')}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Transaction History
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Management */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={updateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ng">Nigeria</SelectItem>
                              <SelectItem value="gh">Ghana</SelectItem>
                              <SelectItem value="ke">Kenya</SelectItem>
                              <SelectItem value="za">South Africa</SelectItem>
                              <SelectItem value="eg">Egypt</SelectItem>
                              <SelectItem value="ma">Morocco</SelectItem>
                              <SelectItem value="et">Ethiopia</SelectItem>
                              <SelectItem value="tz">Tanzania</SelectItem>
                              <SelectItem value="ug">Uganda</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">Postal Code</Label>
                          <Input
                            id="postal_code"
                            value={formData.postal_code}
                            onChange={(e) => handleInputChange('postal_code', e.target.value)}
                          />
                        </div>
                      </div>

                      <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Update Profile
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Role</CardTitle>
                    <CardDescription>
                      Change your account type to access different features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Account Type</Label>
                        <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="seller">Seller</SelectItem>
                            <SelectItem value="sme">SME Business</SelectItem>
                            <SelectItem value="trainer">Trainer/Educator</SelectItem>
                          </SelectContent>
                        </Select>
                        {!profile.metadata?.profile_complete && (formData.role === 'seller' || formData.role === 'sme' || formData.role === 'trainer') && (
                          <p className="text-sm text-yellow-600">
                            This role requires profile completion before activation.
                          </p>
                        )}
                      </div>
                      
                      {(formData.role === 'seller' || formData.role === 'sme' || formData.role === 'trainer') && (
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            Seller roles require KYC verification. 
                            <Button 
                              variant="link" 
                              className="p-0 h-auto ml-1"
                              onClick={() => onNavigate('kyc')}
                            >
                              Complete KYC verification
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Button onClick={updateRole} disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Update Role
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                      Customize your experience on AfriConnect.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="sw">Swahili</SelectItem>
                            <SelectItem value="ha">Hausa</SelectItem>
                            <SelectItem value="am">Amharic</SelectItem>
                            <SelectItem value="ar">Arabic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GMT-1">GMT-1</SelectItem>
                            <SelectItem value="GMT+0">GMT+0</SelectItem>
                            <SelectItem value="GMT+1">GMT+1</SelectItem>
                            <SelectItem value="GMT+2">GMT+2</SelectItem>
                            <SelectItem value="GMT+3">GMT+3</SelectItem>
                            <SelectItem value="GMT+4">GMT+4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Notification Preferences</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive updates via email</p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={formData.notifications.email}
                            onCheckedChange={(checked) => handleNestedInputChange('notifications', 'email', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="sms-notifications">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                          </div>
                          <Switch
                            id="sms-notifications"
                            checked={formData.notifications.sms}
                            onCheckedChange={(checked) => handleNestedInputChange('notifications', 'sms', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive push notifications</p>
                          </div>
                          <Switch
                            id="push-notifications"
                            checked={formData.notifications.push}
                            onCheckedChange={(checked) => handleNestedInputChange('notifications', 'push', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={updatePreferences} disabled={isSaving}>
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                    <CardDescription>
                      Manage your account status and data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-yellow-700">Deactivate Account</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Temporarily disable your account. You can reactivate it by signing in again.
                        </p>
                        <Button variant="outline" onClick={deactivateAccount} disabled={isSaving}>
                          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Deactivate Account
                        </Button>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-destructive">Delete Account</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                          <DialogTrigger asChild>
                            <Button variant="destructive">
                              Delete Account
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Account</DialogTitle>
                              <DialogDescription>
                                This will permanently delete your account and all associated data. This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="delete-confirmation">
                                  Type "DELETE" to confirm
                                </Label>
                                <Input
                                  id="delete-confirmation"
                                  value={deleteConfirmation}
                                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                                  placeholder="DELETE"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowDeleteDialog(false);
                                    setDeleteConfirmation('');
                                  }}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={deleteAccount}
                                  disabled={isSaving || deleteConfirmation.toLowerCase() !== 'delete'}
                                  className="flex-1"
                                >
                                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Delete Account
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}