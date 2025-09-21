import { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, Camera, CheckCircle, XCircle, Loader2, AlertCircle, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

interface KYCPageProps {
  onNavigate: (page: string) => void;
}

type KYCStep = 'personal' | 'business' | 'documents' | 'review' | 'complete';
type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'incomplete';

interface DocumentUpload {
  id: string;
  name: string;
  file: File | null;
  required: boolean;
  uploaded: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

interface KYCData {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  idNumber: string;
  idType: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  
  // Business Information
  businessName: string;
  businessType: string;
  businessRegistrationNumber: string;
  taxId: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  businessDescription: string;
  estimatedMonthlyVolume: string;
  
  // Contact Information
  primaryPhone: string;
  secondaryPhone: string;
  businessEmail: string;
  website: string;
}

export function KYCPage({ onNavigate }: KYCPageProps) {
  const [currentStep, setCurrentStep] = useState<KYCStep>('personal');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('incomplete');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [kycData, setKycData] = useState<KYCData>({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    idNumber: '',
    idType: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    businessName: '',
    businessType: '',
    businessRegistrationNumber: '',
    taxId: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessPostalCode: '',
    businessDescription: '',
    estimatedMonthlyVolume: '',
    primaryPhone: '',
    secondaryPhone: '',
    businessEmail: '',
    website: ''
  });

  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { id: 'government_id', name: 'Government ID', file: null, required: true, uploaded: false, status: 'pending' },
    { id: 'proof_of_address', name: 'Proof of Address', file: null, required: true, uploaded: false, status: 'pending' },
    { id: 'business_registration', name: 'Business Registration', file: null, required: true, uploaded: false, status: 'pending' },
    { id: 'tax_certificate', name: 'Tax Certificate', file: null, required: false, uploaded: false, status: 'pending' },
    { id: 'bank_statement', name: 'Bank Statement', file: null, required: true, uploaded: false, status: 'pending' },
    { id: 'business_license', name: 'Business License', file: null, required: false, uploaded: false, status: 'pending' }
  ]);

  const steps = [
    { id: 'personal', title: 'Personal Info', completed: false },
    { id: 'business', title: 'Business Info', completed: false },
    { id: 'documents', title: 'Documents', completed: false },
    { id: 'review', title: 'Review', completed: false },
    { id: 'complete', title: 'Complete', completed: false }
  ];

  const handleInputChange = (field: keyof KYCData, value: string) => {
    setKycData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleFileUpload = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('File must be JPEG, PNG, or PDF format');
      return;
    }

    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, file, uploaded: true, status: 'pending' }
          : doc
      )
    );
    setError('');
  };

  const removeDocument = (documentId: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, file: null, uploaded: false, status: 'pending' }
          : doc
      )
    );
  };

  const validatePersonalInfo = () => {
    const required = ['fullName', 'dateOfBirth', 'nationality', 'idNumber', 'idType', 'address', 'city', 'primaryPhone'];
    const missing = required.filter(field => !kycData[field as keyof KYCData]);
    
    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }
    
    // Validate date of birth (must be 18+)
    const birthDate = new Date(kycData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setError('You must be at least 18 years old to complete KYC verification');
      return false;
    }
    
    return true;
  };

  const validateBusinessInfo = () => {
    const required = ['businessName', 'businessType', 'businessAddress', 'businessCity', 'businessDescription'];
    const missing = required.filter(field => !kycData[field as keyof KYCData]);
    
    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const validateDocuments = () => {
    const requiredDocs = documents.filter(doc => doc.required && !doc.uploaded);
    if (requiredDocs.length > 0) {
      setError(`Please upload all required documents: ${requiredDocs.map(doc => doc.name).join(', ')}`);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setError('');
    
    switch (currentStep) {
      case 'personal':
        if (validatePersonalInfo()) {
          setCurrentStep('business');
        }
        break;
      case 'business':
        if (validateBusinessInfo()) {
          setCurrentStep('documents');
        }
        break;
      case 'documents':
        if (validateDocuments()) {
          setCurrentStep('review');
        }
        break;
      case 'review':
        submitKYC();
        break;
    }
  };

  const previousStep = () => {
    switch (currentStep) {
      case 'business':
        setCurrentStep('personal');
        break;
      case 'documents':
        setCurrentStep('business');
        break;
      case 'review':
        setCurrentStep('documents');
        break;
    }
  };

  const submitKYC = async () => {
    setIsLoading(true);
    setError('');

    try {
      // In a real app, you would upload files and submit data to your KYC service
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setVerificationStatus('pending');
      setCurrentStep('complete');
      setSuccess('KYC application submitted successfully! We will review your information within 2-3 business days.');
    } catch (err: any) {
      setError('Failed to submit KYC application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepNumber = (stepId: string) => {
    return steps.findIndex(step => step.id === stepId) + 1;
  };

  const getProgressPercentage = () => {
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);
    return ((currentStepIndex + 1) / steps.length) * 100;
  };

  const renderPersonalInfoStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Provide your personal details as they appear on your government-issued ID.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={kycData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={kycData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality *</Label>
            <Select value={kycData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ng">Nigerian</SelectItem>
                <SelectItem value="gh">Ghanaian</SelectItem>
                <SelectItem value="ke">Kenyan</SelectItem>
                <SelectItem value="za">South African</SelectItem>
                <SelectItem value="eg">Egyptian</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="idType">ID Type *</Label>
            <Select value={kycData.idType} onValueChange={(value) => handleInputChange('idType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="national_id">National ID</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
                <SelectItem value="voters_card">Voter's Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">ID Number *</Label>
          <Input
            id="idNumber"
            value={kycData.idNumber}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            placeholder="Enter your ID number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={kycData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter your full address"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={kycData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              value={kycData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="State"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={kycData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder="Postal code"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryPhone">Primary Phone Number *</Label>
          <Input
            id="primaryPhone"
            type="tel"
            value={kycData.primaryPhone}
            onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderBusinessInfoStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>
          Provide details about your business or trading activities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={kycData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="Enter your business name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Select value={kycData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="limited_company">Limited Company</SelectItem>
                <SelectItem value="cooperative">Cooperative</SelectItem>
                <SelectItem value="ngo">NGO</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessRegistrationNumber">Registration Number</Label>
            <Input
              id="businessRegistrationNumber"
              value={kycData.businessRegistrationNumber}
              onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
              placeholder="Business registration number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID</Label>
            <Input
              id="taxId"
              value={kycData.taxId}
              onChange={(e) => handleInputChange('taxId', e.target.value)}
              placeholder="Tax identification number"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessAddress">Business Address *</Label>
          <Input
            id="businessAddress"
            value={kycData.businessAddress}
            onChange={(e) => handleInputChange('businessAddress', e.target.value)}
            placeholder="Enter your business address"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessCity">City *</Label>
            <Input
              id="businessCity"
              value={kycData.businessCity}
              onChange={(e) => handleInputChange('businessCity', e.target.value)}
              placeholder="City"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessState">State/Province</Label>
            <Input
              id="businessState"
              value={kycData.businessState}
              onChange={(e) => handleInputChange('businessState', e.target.value)}
              placeholder="State"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessPostalCode">Postal Code</Label>
            <Input
              id="businessPostalCode"
              value={kycData.businessPostalCode}
              onChange={(e) => handleInputChange('businessPostalCode', e.target.value)}
              placeholder="Postal code"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription">Business Description *</Label>
          <Textarea
            id="businessDescription"
            value={kycData.businessDescription}
            onChange={(e) => handleInputChange('businessDescription', e.target.value)}
            placeholder="Describe your business activities and products/services"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimatedMonthlyVolume">Estimated Monthly Sales Volume</Label>
            <Select value={kycData.estimatedMonthlyVolume} onValueChange={(value) => handleInputChange('estimatedMonthlyVolume', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select volume range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50000">£0 - £50,000</SelectItem>
                <SelectItem value="50000-200000">£50,000 - £200,000</SelectItem>
                <SelectItem value="200000-500000">£200,000 - £500,000</SelectItem>
                <SelectItem value="500000-1000000">£500,000 - £1,000,000</SelectItem>
                <SelectItem value="1000000+">£1,000,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              id="businessEmail"
              type="email"
              value={kycData.businessEmail}
              onChange={(e) => handleInputChange('businessEmail', e.target.value)}
              placeholder="business@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            type="url"
            value={kycData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderDocumentsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>
          Upload clear, high-quality images or PDFs of the required documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {documents.map((document) => (
          <div key={document.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{document.name}</span>
                {document.required && <Badge variant="secondary">Required</Badge>}
              </div>
              {document.uploaded && (
                <Badge variant={document.status === 'approved' ? 'default' : document.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {document.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {document.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                  {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                </Badge>
              )}
            </div>
            
            {document.uploaded && document.file ? (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{document.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(document.file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(document.id)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  PNG, JPG, PDF up to 5MB
                </p>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => handleFileUpload(document.id, e)}
                  className="hidden"
                  id={`file-${document.id}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.document.getElementById(`file-${document.id}`)?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>
        ))}
        
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            All documents are encrypted and stored securely. We only use them for verification purposes and comply with data protection regulations.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Information</CardTitle>
          <CardDescription>
            Please review all the information before submitting your KYC application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {kycData.fullName}</div>
              <div><span className="text-muted-foreground">Date of Birth:</span> {kycData.dateOfBirth}</div>
              <div><span className="text-muted-foreground">Nationality:</span> {kycData.nationality}</div>
              <div><span className="text-muted-foreground">ID Type:</span> {kycData.idType}</div>
              <div><span className="text-muted-foreground">ID Number:</span> {kycData.idNumber}</div>
              <div><span className="text-muted-foreground">Phone:</span> {kycData.primaryPhone}</div>
              <div className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {kycData.address}, {kycData.city}</div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Business Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Business Name:</span> {kycData.businessName}</div>
              <div><span className="text-muted-foreground">Type:</span> {kycData.businessType}</div>
              <div><span className="text-muted-foreground">Registration Number:</span> {kycData.businessRegistrationNumber || 'N/A'}</div>
              <div><span className="text-muted-foreground">Tax ID:</span> {kycData.taxId || 'N/A'}</div>
              <div className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {kycData.businessAddress}, {kycData.businessCity}</div>
              <div className="md:col-span-2"><span className="text-muted-foreground">Description:</span> {kycData.businessDescription}</div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Documents</h4>
            <div className="space-y-2">
              {documents.filter(doc => doc.uploaded).map(doc => (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <span>{doc.name}</span>
                  <Badge variant="secondary">Uploaded</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompleteStep = () => (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">KYC Application Submitted</h3>
        <p className="text-muted-foreground mb-6">
          Thank you for submitting your KYC information. Our team will review your application within 2-3 business days.
        </p>
        
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span>Application Status:</span>
            <Badge variant={verificationStatus === 'approved' ? 'default' : verificationStatus === 'rejected' ? 'destructive' : 'secondary'}>
              {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>What happens next:</p>
          <ul className="space-y-1 text-left max-w-md mx-auto">
            <li>• We'll verify your documents and information</li>
            <li>• You'll receive an email with the verification result</li>
            <li>• Once approved, you can start selling on AfriConnect</li>
            <li>• If additional information is needed, we'll contact you</li>
          </ul>
        </div>
        
        <div className="mt-6 space-y-2">
          <Button onClick={() => onNavigate('home')} className="w-full">
            Return to Home
          </Button>
          <Button variant="outline" onClick={() => onNavigate('profile')} className="w-full">
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('profile')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
            <div>
              <h1 className="text-2xl font-bold">KYC Verification</h1>
              <p className="text-muted-foreground">Complete your seller verification to start trading</p>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Verification Progress</span>
                <span className="text-sm text-muted-foreground">
                  Step {getStepNumber(currentStep)} of {steps.length}
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="mb-4" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {steps.map((step) => (
                  <span key={step.id} className={currentStep === step.id ? 'text-primary font-medium' : ''}>
                    {step.title}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

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

          {/* Step Content */}
          <div className="mb-6">
            {currentStep === 'personal' && renderPersonalInfoStep()}
            {currentStep === 'business' && renderBusinessInfoStep()}
            {currentStep === 'documents' && renderDocumentsStep()}
            {currentStep === 'review' && renderReviewStep()}
            {currentStep === 'complete' && renderCompleteStep()}
          </div>

          {/* Navigation Buttons */}
          {currentStep !== 'complete' && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 'personal'}
              >
                Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {currentStep === 'review' ? 'Submit Application' : 'Next'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}