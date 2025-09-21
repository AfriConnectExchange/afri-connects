import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Eye, ShoppingCart, 
  Download, Calendar, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  BarChart3, PieChart, Activity, MapPin, Clock, Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AnimatedButton } from './ui/animated-button';
import { CustomModal } from './ui/custom-modal';
import { CustomAlert } from './ui/custom-alert';

interface AnalyticsPageProps {
  onNavigate: (page: string) => void;
}

// Mock data for demonstration
const mockAnalytics = {
  sme: {
    revenue: { current: 45780, previous: 42150, change: 8.6 },
    activeAdverts: { current: 12, previous: 15, change: -20 },
    engagementRate: { current: 24.5, previous: 22.1, change: 10.9 },
    topItems: [
      { name: 'African Textiles Bundle', sales: 156, revenue: 12400 },
      { name: 'Organic Spice Collection', sales: 89, revenue: 8900 },
      { name: 'Handcrafted Jewelry Set', sales: 67, revenue: 6700 }
    ]
  },
  admin: {
    totalSMEs: { current: 1247, previous: 1180, change: 5.7 },
    platformRevenue: { current: 234567, previous: 218945, change: 7.1 },
    activeUsers: { current: 12543, previous: 11890, change: 5.5 },
    regionalBreakdown: [
      { region: 'West Africa', users: 5432, revenue: 89654 },
      { region: 'East Africa', users: 3456, revenue: 67890 },
      { region: 'Central Africa', users: 2345, revenue: 45678 },
      { region: 'Southern Africa', users: 1310, revenue: 31345 }
    ]
  }
};

const timeRanges = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 3 months', value: '3m' },
  { label: 'Last 12 months', value: '12m' }
];

export function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const [userType, setUserType] = useState<'sme' | 'admin'>('sme');
  const [timeRange, setTimeRange] = useState('30d');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
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

  const currentData = mockAnalytics[userType];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showAlert('success', 'Export Complete', `Your ${exportFormat.toUpperCase()} report has been generated and downloaded.`);
    setShowExportModal(false);
    setIsExporting(false);
  };

  const MetricCard = ({ 
    title, 
    value, 
    previousValue, 
    change, 
    icon: Icon, 
    suffix = '',
    prefix = '' 
  }: {
    title: string;
    value: number;
    previousValue: number;
    change: number;
    icon: React.ComponentType<{ className?: string }>;
    suffix?: string;
    prefix?: string;
  }) => (
    <Card className="relative overflow-hidden bg-white border border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-foreground">
              {prefix}{value.toLocaleString()}{suffix}
            </p>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {change >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span className="text-xs font-medium">
                  {Math.abs(change).toFixed(1)}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="bg-white border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
          {children}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-semibold text-foreground mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Track performance and make data-driven decisions</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <AnimatedButton
                onClick={() => setShowExportModal(true)}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </AnimatedButton>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* User Type Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Tabs value={userType} onValueChange={(value) => setUserType(value as 'sme' | 'admin')}>
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="sme">SME Dashboard</TabsTrigger>
              <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="sme" className="mt-6 space-y-6">
              {/* SME Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Sales Revenue"
                  value={(currentData as any).revenue?.current || 0}
                  previousValue={(currentData as any).revenue?.previous || 0}
                  change={(currentData as any).revenue?.change || 0}
                  icon={DollarSign}
                  prefix="£"
                />
                <MetricCard
                  title="Active Adverts"
                  value={(currentData as any).activeAdverts?.current || 0}
                  previousValue={(currentData as any).activeAdverts?.previous || 0}
                  change={(currentData as any).activeAdverts?.change || 0}
                  icon={TrendingUp}
                />
                <MetricCard
                  title="Engagement Rate"
                  value={(currentData as any).engagementRate?.current || 0}
                  previousValue={(currentData as any).engagementRate?.previous || 0}
                  change={(currentData as any).engagementRate?.change || 0}
                  icon={Eye}
                  suffix="%"
                />
                <MetricCard
                  title="Avg. Order Value"
                  value={156}
                  previousValue={142}
                  change={9.9}
                  icon={ShoppingCart}
                  prefix="£"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Revenue Trend">
                  <div className="text-center space-y-2">
                    <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Revenue chart visualization</p>
                  </div>
                </ChartCard>

                <ChartCard title="Sales by Category">
                  <div className="text-center space-y-2">
                    <PieChart className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Category breakdown chart</p>
                  </div>
                </ChartCard>
              </div>

              {/* Top Selling Items */}
              <Card className="bg-white border border-border">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Top Selling Items</CardTitle>
                  <CardDescription>Your best performing products this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {((currentData as any).topItems || []).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.sales} sales</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">£{item.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="mt-6 space-y-6">
              {/* Admin Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total SMEs"
                  value={(currentData as any).totalSMEs?.current || 0}
                  previousValue={(currentData as any).totalSMEs?.previous || 0}
                  change={(currentData as any).totalSMEs?.change || 0}
                  icon={Users}
                />
                <MetricCard
                  title="Platform Revenue"
                  value={(currentData as any).platformRevenue?.current || 0}
                  previousValue={(currentData as any).platformRevenue?.previous || 0}
                  change={(currentData as any).platformRevenue?.change || 0}
                  icon={DollarSign}
                  prefix="£"
                />
                <MetricCard
                  title="Active Users"
                  value={(currentData as any).activeUsers?.current || 0}
                  previousValue={(currentData as any).activeUsers?.previous || 0}
                  change={(currentData as any).activeUsers?.change || 0}
                  icon={Activity}
                />
                <MetricCard
                  title="Avg. Revenue per SME"
                  value={188}
                  previousValue={186}
                  change={1.1}
                  icon={TrendingUp}
                  prefix="£"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Platform Growth">
                  <div className="text-center space-y-2">
                    <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Growth metrics visualization</p>
                  </div>
                </ChartCard>

                <ChartCard title="User Activity">
                  <div className="text-center space-y-2">
                    <Activity className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">User engagement metrics</p>
                  </div>
                </ChartCard>
              </div>

              {/* Regional Breakdown */}
              <Card className="bg-white border border-border">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Regional Breakdown</CardTitle>
                  <CardDescription>User and revenue distribution across Africa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {((currentData as any).regionalBreakdown || []).map((region, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{region.region}</p>
                            <p className="text-sm text-muted-foreground">{region.users.toLocaleString()} users</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">£{region.revenue.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Export Modal */}
      <CustomModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Analytics Report"
        description="Choose your preferred format and generate a comprehensive analytics report"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportFormat === 'pdf'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/20 hover:border-primary/50'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-xs font-semibold text-primary">PDF</span>
                  </div>
                  <p className="text-sm font-medium">PDF Report</p>
                  <p className="text-xs text-muted-foreground">Visual charts & summaries</p>
                </div>
              </button>
              
              <button
                onClick={() => setExportFormat('excel')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportFormat === 'excel'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/20 hover:border-primary/50'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-xs font-semibold text-primary">XLS</span>
                  </div>
                  <p className="text-sm font-medium">Excel File</p>
                  <p className="text-xs text-muted-foreground">Raw data & calculations</p>
                </div>
              </button>
            </div>
          </div>

          <div className="p-4 bg-muted/20 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Export Details</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Time Range: {timeRanges.find(r => r.value === timeRange)?.label}</p>
              <p>• Dashboard Type: {userType === 'sme' ? 'SME Analytics' : 'Admin Analytics'}</p>
              <p>• Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <AnimatedButton
              onClick={handleExport}
              isLoading={isExporting}
              loadingText="Generating..."
              className="flex-1"
            >
              Generate Report
            </AnimatedButton>
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
              disabled={isExporting}
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