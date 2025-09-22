import React, { useState, useEffect, useCallback } from 'react';
import { useUITexts } from '../hooks/useUITexts';
import NewspaperCard from './NewspaperCard';
import { useToast } from './ToastContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// Simple validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateContent = (content: string, limit: number): boolean => {
  return content.length >= 10 && content.length <= limit;
};

const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

// Color options for background - Updated to match validation (only 5 colors)
const bgColorOptions = [
  { name: 'Default White', value: '#ffffff' },
  { name: 'Light Blue', value: '#e6f3ff' },
  { name: 'Soft Blue', value: '#cce7ff' },
  { name: 'Light Pink', value: '#ffe6f0' },
  { name: 'Soft Pink', value: '#ffcce6' }
];

type PaymentCalculation = {
  baseAmount?: number;
  additionalCharacters: number;
  additionalCost?: number;
  fontMultiplier: number;
  subtotal: number;
  visibilityMultiplier: number;
  discountAmount: number;
  couponCode?: string;
  finalAmount: number;
};

export default function PostAdDialog({ 
  open, 
  onClose, 
  onSuccess,
  isAuthenticated = false,
  userEmail = '',
  jwt = ''
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isAuthenticated?: boolean;
  userEmail?: string;
  jwt?: string;
}) {
  const { texts } = useUITexts();
  const { showSuccess, showError, showInfo } = useToast();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [lookingFor, setLookingFor] = useState<'bride' | 'groom'>('bride');
  const [duration, setDuration] = useState<14 | 21 | 28>(14); // Updated: 2, 3, 4 weeks
  const [characterLimit, setCharacterLimit] = useState(200); // Updated: Base limit is 200
  const [currentCharacters, setCurrentCharacters] = useState(0);
  const [fontSize, setFontSize] = useState<'default' | 'large'>('default'); // Updated: removed 'medium'
  const [paymentCalculation, setPaymentCalculation] = useState<PaymentCalculation | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  
  // Update character count when content changes
  useEffect(() => {
    setCurrentCharacters(content.length);
  }, [content]);
  
  const calculatePayment = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/payment/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          fontSize,
          duration,
          couponCode: couponCode || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setPaymentCalculation(data.calculation);
      }
    } catch (error) {
      console.error('Payment calculation error:', error);
    }
  }, [content, fontSize, duration, couponCode]);

  // Calculate payment when content, fontSize, or duration changes
  useEffect(() => {
    if (content.length >= 10) {
      calculatePayment();
    }
  }, [content, fontSize, duration, couponCode, calculatePayment]);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Auto-populate email for authenticated users and reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Reset form state when dialog opens
      setStep('form');
      setContent('');
      setLookingFor('bride');
      setDuration(14);
      setCharacterLimit(200);
      setCurrentCharacters(0);
      setFontSize('default');
      setBgColor('#ffffff');
      setOtp('');
      setError('');
      setInfo('');
      setPaymentCalculation(null);
      setCouponCode('');
      setCouponApplied(false);
      
      // Set email for authenticated users
      if (isAuthenticated && userEmail) {
        setEmail(userEmail);
      } else {
        setEmail('');
      }
    }
  }, [open, isAuthenticated, userEmail]);

  const handleRequestOtp = async () => {
    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      showError('Invalid Email', errorMsg);
      return;
    }
    if (content.length < 10) {
      const errorMsg = 'Content must be at least 10 characters long';
      setError(errorMsg);
      showError('Invalid Content', errorMsg);
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStep('otp');
      const successMsg = 'OTP sent to your email. Please check and enter below.';
      setInfo(successMsg);
      showSuccess('OTP Sent', 'Check your email for the verification code');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to send OTP';
      setError(errorMessage);
      showError('OTP Request Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // For authenticated users - direct post creation
  const handleAuthenticatedSubmit = async () => {
    if (!validateContent(content, characterLimit)) {
      const errorMsg = `Content must be between 10 and ${characterLimit} characters`;
      setError(errorMsg);
      showError('Invalid Content', errorMsg);
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/posts/authenticated`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ 
          content, 
          lookingFor, 
          duration, 
          fontSize, 
          bgColor,
          couponCode: couponCode || undefined
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      const successMsg = 'Ad posted successfully and pending approval!';
      setInfo(successMsg);
      showSuccess('Ad Submitted Successfully', 'Your matrimonial advertisement is submitted for manual screening and approval by the admin. Keep checking your email for further status updates.');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to post ad';
      setError(errorMessage);
      showError('Ad Submission Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // For anonymous users - OTP verification
  const handleAnonymousSubmit = async () => {
    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      showError('Invalid Email', errorMsg);
      return;
    }
    if (content.length < 10) {
      const errorMsg = 'Content must be at least 10 characters long';
      setError(errorMsg);
      showError('Invalid Content', errorMsg);
      return;
    }
    if (!validateOTP(otp)) {
      const errorMsg = 'Please enter a valid 6-digit OTP';
      setError(errorMsg);
      showError('Invalid OTP', errorMsg);
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          content, 
          otp, 
          lookingFor, 
          duration, 
          fontSize, 
          bgColor,
          couponCode: couponCode || undefined
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      const successMsg = 'Ad posted successfully and pending approval!';
      setInfo(successMsg);
      showSuccess('Ad Submitted Successfully', 'Your matrimonial advertisement is submitted for manual screening and approval by the admin. Keep checking your email for further status updates.');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to post ad';
      setError(errorMessage);
      showError('Ad Submission Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const closeSheet = () => {
    setStep('form'); 
    if (!isAuthenticated) setEmail(''); 
    setContent(''); 
    setLookingFor('bride');
    setDuration(14); // Reset to default 14 days
    setCharacterLimit(200); // Reset to base limit
    setCurrentCharacters(0);
    setFontSize('default');
    setBgColor('#ffffff');
    setOtp(''); 
    setError(''); 
    setInfo('');
    setPaymentCalculation(null); // Reset payment calculation
    setCouponCode(''); // Reset coupon code
    setCouponApplied(false); // Reset coupon applied state
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeSheet}
      />

      {/* Right-side sheet */}
      <aside
        className={`fixed right-0 top-0 h-full z-50 w-full sm:w-[560px] max-w-[98vw] border-l border-gray-400 transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          backgroundColor: 'var(--color-newsprint)',
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/clean-gray-paper.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }}
        aria-hidden={!open}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-4 border-b-2" style={{ borderColor: 'var(--color-ink)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wide" style={{ color: 'var(--color-headline)', fontFamily: 'var(--font-serif)' }}>{texts.postAd}</h3>
                <p className="text-xs" style={{ color: '#4b5563' }}>Create your matrimonial advertisement</p>
              </div>
              <button
                onClick={closeSheet}
                className="px-3 py-1 text-xs border border-gray-500 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Status Info */}
          <div className="px-5 py-3 border-b border-gray-300">
            {isAuthenticated ? (
              <div className="text-sm" style={{ color: '#065f46' }}>
                You&apos;re logged in as <strong>{userEmail}</strong>. You can post ads directly without OTP verification.
              </div>
            ) : (
              <div className="text-sm" style={{ color: '#1f2937' }}>
                Enter your details and ad content. We&apos;ll verify your email with an OTP before posting.
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Form sections */}
            <div className="space-y-4">
              {!isAuthenticated && step === 'form' && (
                <div className="border border-gray-300">
                  <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                    <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>{texts.yourEmail}</h4>
                  </div>
                  <div className="p-4 bg-white/70">
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" placeholder={texts.emailPlaceholder} autoFocus />
                  </div>
                </div>
              )}

              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>I am looking for</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <select value={lookingFor} onChange={e => setLookingFor(e.target.value as 'bride' | 'groom')}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black">
                    <option value="bride">Bride</option>
                    <option value="groom">Groom</option>
                  </select>
                </div>
              </div>

              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Ad Duration</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <select value={duration} onChange={e => setDuration(Number(e.target.value) as 14 | 21 | 28)}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black">
                    <option value={14}>2 weeks</option>
                    <option value={21}>3 weeks</option>
                    <option value={28}>4 weeks</option>
                  </select>
                </div>
              </div>

              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Font Size</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <select value={fontSize} onChange={e => setFontSize(e.target.value as 'default' | 'large')}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black">
                    <option value="default">Default</option>
                    <option value="large">Large (+20%)</option>
                  </select>
                </div>
              </div>

              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Background Color</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {bgColorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setBgColor(color.value)}
                        className={`p-3 border transition-colors ${
                          bgColor === color.value
                            ? 'border-black'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        <span className="sr-only">{color.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Selected: {bgColorOptions.find(c => c.value === bgColor)?.name}
                  </p>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Coupon Code (Optional)</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode} 
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={calculatePayment}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-green-600 text-sm mt-2">✓ Coupon applied successfully!</p>
                  )}
                </div>
              </div>

              {/* Payment Calculation Display */}
              {paymentCalculation && (
                <div className="border border-gray-300">
                  <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                    <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Payment Summary</h4>
                  </div>
                  <div className="p-4 bg-white/70">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base amount (first 200 chars):</span>
                        <span>₹{paymentCalculation.baseAmount?.toLocaleString('en-IN')}</span>
                      </div>
                      {paymentCalculation.additionalCharacters > 0 && (
                        <div className="flex justify-between">
                          <span>Additional chars ({paymentCalculation.additionalCharacters}):</span>
                          <span>₹{paymentCalculation.additionalCost?.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {paymentCalculation.fontMultiplier > 1 && typeof paymentCalculation.baseAmount === 'number' && (
                        <div className="flex justify-between">
                          <span>Large font (+20%):</span>
                          <span>+₹{Math.round(paymentCalculation.subtotal - paymentCalculation.baseAmount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Duration ({duration} days):</span>
                        <span>×{paymentCalculation.visibilityMultiplier}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Subtotal:</span>
                        <span>₹{paymentCalculation.subtotal?.toLocaleString('en-IN')}</span>
                      </div>
                      {paymentCalculation.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({paymentCalculation.couponCode}):</span>
                          <span>-₹{paymentCalculation.discountAmount?.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">₹{paymentCalculation.finalAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                      {texts.adContent}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        currentCharacters > 200 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {currentCharacters} characters
                        {currentCharacters > 200 && (
                          <span className="text-gray-500"> (200 free + {currentCharacters - 200} paid)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/70">
                  <textarea 
                    required 
                    value={content} 
                    onChange={e => setContent(e.target.value)}
                    className={`w-full px-3 py-2 border focus:outline-none min-h-[120px] resize-vertical ${
                      currentCharacters > 200 ? 'border-red-300 focus:border-red-600' :
                      'border-gray-300 focus:border-black'
                    }`}
                    placeholder={texts.contentPlaceholder} 
                  />
                  {currentCharacters > 200 && (
                    <div className="mt-2 text-xs text-red-600">
                      Characters beyond 200 will be charged at ₹500 per 20 characters
                    </div>
                  )}
                </div>
              </div>

              {error && <div className="p-3 border border-red-200 text-red-800 text-sm">{error}</div>}
              {info && <div className="p-3 border border-green-200 text-green-800 text-sm">{info}</div>}

              {/* OTP step for anonymous users */}
              {!isAuthenticated && step === 'otp' && (
                <div className="border border-gray-300">
                  <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                    <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Verify OTP</h4>
                  </div>
                  <div className="p-4 bg-white/70">
                    <input type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" placeholder={texts.otpPlaceholder} autoFocus />
                  </div>
                </div>
              )}

              {/* Live Preview */}
              <div className="border border-gray-800">
                <div className="px-4 py-3 border-b border-gray-800" style={{ backgroundColor: 'var(--color-newsprint)' }}>
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Live Preview</h4>
                </div>
                <div className="p-3" style={{ backgroundColor: 'var(--color-newsprint)' }}>
                  <NewspaperCard
                    content={content || 'Seeking alliance: Educated, family-oriented, and kind-hearted. Please contact for more details.'}
                    selected={false}
                    onSelect={() => {}}
                    onEmail={() => {}}
                    fontSize={fontSize}
                    bgColor={bgColor}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-5 py-4 border-t border-gray-300 bg-white/60">
            <div className="flex justify-end gap-3">
              <button
                onClick={closeSheet}
                className="px-4 py-2 text-sm border border-gray-500 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              {isAuthenticated ? (
                <button
                  onClick={handleAuthenticatedSubmit}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-black text-white"
                  style={{ backgroundColor: 'var(--color-ink)' }}
                >
                  {loading ? 'Posting Ad...' : texts.submit}
                </button>
              ) : (
                step === 'form' ? (
                  <button
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="px-4 py-2 text-sm border border-black text-white"
                    style={{ backgroundColor: 'var(--color-ink)' }}
                  >
                    {loading ? 'Sending OTP...' : texts.requestOtp}
                  </button>
                ) : (
                  <button
                    onClick={handleAnonymousSubmit}
                    disabled={loading}
                    className="px-4 py-2 text-sm border border-black text-white"
                    style={{ backgroundColor: 'var(--color-ink)' }}
                  >
                    {loading ? 'Posting Ad...' : texts.submit}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
} 