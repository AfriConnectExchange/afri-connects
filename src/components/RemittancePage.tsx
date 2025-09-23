// FILE: src/components/RemittancePage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, History, Search, CheckCircle, Clock, AlertCircle, Eye, Download, 
  ArrowRight, CreditCard, Wallet, Loader2
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AnimatedButton } from './ui/animated-button';
import { CustomModal } from './ui/custom-modal';
import { CustomAlert } from './ui/custom-alert';

const mockRates = { "NGN": 1800.52, "KES": 168.33, "GHS": 15.41, "ZAR": 22.87 };

function useExchangeRates() {
  const [rates, setRates] = useState<Record<string, number> | null>(mockRates);
  return { rates };
}

interface RemittancePageProps {
  onNavigate: (page: string) => void;
}
const mockTransfers = [
    { id: 'AC-REM-001', recipient: 'John Doe', amountSent: 250, recipientCountry: 'Nigeria', status: 'delivered', date: '2025-09-20T14:30:00Z', paymentMethod: 'Credit Card'},
    { id: 'AC-REM-002', recipient: 'Sarah Johnson', amountSent: 150, recipientCountry: 'Kenya', status: 'pending', date: '2025-09-19T10:00:00Z', paymentMethod: 'Digital Wallet'},
    { id: 'AC-REM-003', recipient: 'Michael Brown', amountSent: 500, recipientCountry: 'Ghana', status: 'failed', date: '2025-09-18T16:45:00Z', paymentMethod: 'Credit Card'}
];
const countries = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' }
];
const MIN_SEND_AMOUNT = 5.00;
const FEE_PERCENTAGE = 0.015;

export function RemittancePage({ onNavigate }: RemittancePageProps) {
  const { rates } = useExchangeRates();
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  
  const [modalView, setModalView] = useState<'send' | 'details' | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<(typeof mockTransfers)[0] | null>(null);
  const [sendStep, setSendStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [fee, setFee] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recipientDetails, setRecipientDetails] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const [alertState, setAlertState] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string; }>({ isOpen: false, type: 'success', title: '', message: '' });
  const showAlert = (type: 'success' | 'error', title: string, message: string) => setAlertState({ isOpen: true, type, title, message });

  useEffect(() => {
    const amount = parseFloat(sendAmount); setError(null);
    if (!amount || isNaN(amount) || !rates || !selectedCountry) { setReceiveAmount(0); setFee(0); setExchangeRate(0); return; }
    if (amount > 0 && amount < MIN_SEND_AMOUNT) { setError(`Minimum transfer amount is £${MIN_SEND_AMOUNT.toFixed(2)}`); setReceiveAmount(0); setFee(0); setExchangeRate(0); return; }
    const rate = rates[selectedCountry.currency] || 0; const calculatedFee = amount * FEE_PERCENTAGE;
    const amountToConvert = amount - calculatedFee; setExchangeRate(rate); setFee(calculatedFee); setReceiveAmount(amountToConvert * rate);
  }, [sendAmount, selectedCountry, rates]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTransfers = mockTransfers.filter(transfer => {
    const matchesSearch = transfer.recipient.toLowerCase().includes(searchQuery.toLowerCase()) || transfer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenSendModal = () => { setModalView('send'); setSendStep(1); };
  const handleOpenDetailsModal = (transfer: (typeof mockTransfers)[0]) => { setSelectedTransfer(transfer); setModalView('details'); };
  const closeModal = () => { setModalView(null); setSendStep(1); setIsProcessing(false); };

  const handleFinalSend = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    closeModal();
    showAlert('success', 'Transfer Successful!', `Your transfer of £${parseFloat(sendAmount).toFixed(2)} to ${recipientDetails.name} has been initiated.`);
    setSendAmount(''); setRecipientDetails({ name: '', phone: '' }); setPaymentMethod('card');
  };
  
  const isSendDetailsValid = recipientDetails.name.length > 2 && recipientDetails.phone.length > 5;
  const isButtonDisabled = !!error || !sendAmount || parseFloat(sendAmount) < MIN_SEND_AMOUNT;
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'delivered': return { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'pending': return { Icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' };
      case 'failed': return { Icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' };
      default: return { Icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Money Transfer</h1>
              <p className="text-gray-500">Send money securely across Africa</p>
            </div>
            <AnimatedButton onClick={() => setActiveTab('send')} size="sm" className="flex items-center gap-2 !p-2 md:!px-4 md:!py-2">
              <Send className="w-4 h-4" /> <span className="hidden md:inline">Send Money</span>
            </AnimatedButton>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
            <div className="flex space-x-2 p-1 bg-slate-200/60 rounded-lg">
                <Button variant={activeTab === 'send' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('send')} className="w-32">Send Money</Button>
                <Button variant={activeTab === 'history' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('history')} className="w-32">Transfer History</Button>
            </div>
        </div>

        {activeTab === 'send' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 rounded-xl">
                <CardContent className="p-6 md:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="space-y-3">
                          <Label className="text-gray-500">You send</Label>
                          <div className="relative">
                            <Input 
                              type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)}
                              placeholder="0.00" 
                              className="text-4xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent" 
                            />
                            <div className="absolute top-1/2 -translate-y-1/2 right-0 bg-slate-100 font-medium text-slate-700 px-4 py-2 rounded-lg">GBP</div>
                          </div>
                        </div>
                        <div className="my-6 flex justify-center">
                            <ArrowRight className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-gray-500">Recipient gets</Label>
                          <div className="relative">
                            <p className="text-4xl font-bold text-primary truncate pr-28">
                              {receiveAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <Select onValueChange={(code) => setSelectedCountry(countries.find(c => c.code === code)!)} defaultValue={selectedCountry.code}>
                                <SelectTrigger className="absolute top-1/2 -translate-y-1/2 right-0 w-auto bg-slate-100 font-medium text-slate-700 rounded-lg h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.currency}</SelectItem>)}
                                </SelectContent>
                            </Select>
                          </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 md:mt-0">
                        {error && (
                           <motion.p initial={{ opacity: 0}} animate={{ opacity: 1}} className="text-center text-red-600 text-sm font-medium mb-4">{error}</motion.p>
                        )}
                        <div className="space-y-4 text-sm text-gray-600 p-4 bg-slate-50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p>Exchange rate:</p>
                                <p className="font-medium text-gray-800">1 GBP ≈ {(exchangeRate || 0).toFixed(2)} {selectedCountry.currency}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Fee ({(FEE_PERCENTAGE * 100).toFixed(2)}%):</p>
                                <p className="font-medium text-gray-800">£{fee.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between items-center font-semibold text-gray-800 mt-4 pt-4 border-t">
                                <p>Total to pay:</p>
                                <p>£{(parseFloat(sendAmount) || 0).toFixed(2)}</p>
                            </div>
                        </div>
                        <AnimatedButton size="lg" className="w-full mt-6" disabled={isButtonDisabled} onClick={handleOpenSendModal}>
                            Continue Transaction
                        </AnimatedButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
        )}
        
        {activeTab === 'history' && (
             <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search by name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-white"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredTransfers.map(transfer => {
                  const { Icon, color, bg } = getStatusProps(transfer.status);
                  const country = countries.find(c => c.name === transfer.recipientCountry);
                  return (
                    <motion.div key={transfer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={() => handleOpenDetailsModal(transfer)} className="cursor-pointer">
                      <div className="bg-white p-4 rounded-lg border border-transparent hover:border-primary/40 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
                                    <Icon className={`w-6 h-6 ${color}`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{transfer.recipient}</h3>
                                    <p className="text-sm text-gray-500">
                                        {country?.flag} To {transfer.recipientCountry} • {transfer.id}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-gray-800">
                                    £{transfer.amountSent.toFixed(2)}
                                </p>
                                <p className={`text-sm font-medium capitalize ${color}`}>{transfer.status}</p>
                            </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
        )}
      </div>

      <AnimatePresence>
        {modalView === 'send' && (
          <CustomModal isOpen={true} onClose={closeModal} title="Complete Your Transfer" description={`Step ${sendStep} of 3`}>
              {sendStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <h3 className="font-semibold text-lg">Recipient Details</h3>
                      <div className="space-y-2">
                          <Label htmlFor="rec-name">Recipient's Full Name</Label>
                          <Input id="rec-name" placeholder="e.g. John Doe" value={recipientDetails.name} onChange={e => setRecipientDetails({...recipientDetails, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="rec-phone">Recipient's Phone Number</Label>
                          <Input id="rec-phone" placeholder="+234 800 000 0000" value={recipientDetails.phone} onChange={e => setRecipientDetails({...recipientDetails, phone: e.target.value})} />
                      </div>
                      <AnimatedButton className="w-full mt-4" onClick={() => setSendStep(2)} disabled={!isSendDetailsValid}>Next</AnimatedButton>
                  </motion.div>
              )}
              {sendStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <h3 className="font-semibold text-lg">Payment Method</h3>
                      <div className="space-y-3">
                          <div onClick={() => setPaymentMethod('card')} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                              <CreditCard className="w-6 h-6 text-primary"/>
                              <div><p className="font-medium">Debit/Credit Card</p><p className="text-sm text-gray-500">Standard processing fees apply</p></div>
                          </div>
                          <div onClick={() => setPaymentMethod('wallet')} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                              <Wallet className="w-6 h-6 text-primary"/>
                              <div><p className="font-medium">Digital Wallet</p><p className="text-sm text-gray-500">Lower fees, faster processing</p></div>
                          </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={() => setSendStep(1)}>Back</Button>
                        <AnimatedButton className="w-full" onClick={() => setSendStep(3)}>Next</AnimatedButton>
                      </div>
                  </motion.div>
              )}
              {sendStep === 3 && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <h3 className="font-semibold text-lg">Review & Confirm</h3>
                        <div className="p-4 bg-slate-100 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">You are sending</span><span className="font-medium text-gray-900">£{parseFloat(sendAmount).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Recipient</span><span className="font-medium text-gray-900">{recipientDetails.name}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">They receive approx.</span><span className="font-medium text-gray-900">{receiveAmount.toLocaleString('en-US', { style: 'currency', currency: selectedCountry.currency })}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold text-gray-900">Total to be charged</span><span className="font-bold text-primary">£{(parseFloat(sendAmount)).toFixed(2)}</span></div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" onClick={() => setSendStep(2)} disabled={isProcessing}>Back</Button>
                            <AnimatedButton className="w-full gap-2" onClick={handleFinalSend} disabled={isProcessing}>
                                {isProcessing && <Loader2 className="w-4 h-4 animate-spin"/>}
                                {isProcessing ? "Processing..." : "Confirm & Send"}
                            </AnimatedButton>
                        </div>
                   </motion.div>
              )}
          </CustomModal>
        )}

        {modalView === 'details' && selectedTransfer && (
          <CustomModal isOpen={true} onClose={closeModal} title="Transfer Receipt" description={`ID: ${selectedTransfer.id}`}>
              <div className="space-y-4">
                  {(() => {
                      const { Icon, color, bg } = getStatusProps(selectedTransfer.status);
                      return (
                          <>
                              <div className="text-center py-4">
                                  <p className="text-gray-500">Amount Sent</p>
                                  <p className="text-4xl font-bold text-gray-800">£{selectedTransfer.amountSent.toFixed(2)}</p>
                                  <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${bg} ${color}`}>
                                      <Icon className="w-4 h-4"/>
                                      <span className="capitalize">{selectedTransfer.status}</span>
                                  </div>
                              </div>
                              <div className="p-4 bg-slate-100 rounded-lg space-y-3">
                                  <div className="flex justify-between items-center">
                                      <span className="text-gray-600">From</span>
                                      <span className="font-medium flex items-center gap-2">🇬🇧 You</span>
                                  </div>
                                  <div className="flex justify-center my-1"><ArrowRight className="w-4 h-4 text-gray-400"/></div>
                                  <div className="flex justify-between items-center">
                                      <span className="text-gray-600">To</span>
                                      <span className="font-medium flex items-center gap-2">{countries.find(c=>c.name === selectedTransfer.recipientCountry)?.flag} {selectedTransfer.recipient}</span>
                                  </div>
                              </div>
                              <div className="pt-2 space-y-2 text-sm">
                                  <div className="flex justify-between"><span className="text-gray-600">Sent on</span><span className="font-medium text-gray-800">{new Date(selectedTransfer.date).toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-600">Payment Method</span><span className="font-medium text-gray-800">{selectedTransfer.paymentMethod}</span></div>
                              </div>
                              <Button variant="outline" className="w-full gap-2"><Download className="w-4 h-4"/>Download Receipt</Button>
                          </>
                      );
                  })()}
              </div>
          </CustomModal>
        )}
      </AnimatePresence>
      
      <CustomAlert isOpen={alertState.isOpen} onClose={() => setAlertState(prev => ({...prev, isOpen: false}))} type={alertState.type} title={alertState.title} message={alertState.message} />
    </div>
  );
}