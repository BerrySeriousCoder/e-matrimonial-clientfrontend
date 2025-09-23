import React, { useState, useEffect } from 'react';
import { useUITexts } from '../hooks/useUITexts';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// Simple validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMessage = (message: string): boolean => {
  return message.length >= 1 && message.length <= 1000;
};

const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export default function EmailDialog({ 
  open, 
  onClose, 
  toEmail, 
  lastMsg, 
  setLastMsg,
  isAuthenticated = false,
  userEmail = '',
  jwt = '',
  postId,
  onOpenAuthDialog
}: {
  open: boolean;
  onClose: () => void;
  toEmail: string;
  lastMsg: string;
  setLastMsg: (msg: string) => void;
  isAuthenticated?: boolean;
  userEmail?: string;
  jwt?: string;
  postId?: number;
  onOpenAuthDialog?: () => void;
}) {
  const { texts } = useUITexts();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [fromEmail, setFromEmail] = useState('');
  const [message, setMessage] = useState(lastMsg);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    setMessage(lastMsg);
    if (isAuthenticated && userEmail) {
      setFromEmail(userEmail);
    } else {
      setFromEmail('');
    }
  }, [lastMsg, open, isAuthenticated, userEmail]);

  // For authenticated users - direct email sending
  const handleAuthenticatedSubmit = async () => {
    if (!validateMessage(message)) {
      setError('Message must be between 1 and 1000 characters');
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/email/send-authenticated`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ message, postId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setInfo('Email sent successfully!');
      setLastMsg(message);
      setTimeout(() => { onClose(); }, 1200);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to send email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // For anonymous users - OTP flow
  const handleRequestOtp = async () => {
    if (!validateEmail(fromEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validateMessage(message)) {
      setError('Message must be between 1 and 1000 characters');
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fromEmail }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStep('otp');
      setInfo('OTP sent to your email. Please check and enter below.');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSubmit = async () => {
    if (!validateEmail(fromEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validateMessage(message)) {
      setError('Message must be between 1 and 1000 characters');
      return;
    }
    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: fromEmail, 
          message, 
          postId,
          otp 
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setInfo('Email sent successfully!');
      setLastMsg(message);
      setTimeout(() => { onClose(); }, 1200);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to send email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  const closeDialog = () => {
    setStep('form'); 
    if (!isAuthenticated) setFromEmail(''); 
    setOtp(''); 
    setError(''); 
    setInfo('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeDialog}
      />

      {/* Right-side sheet */}
      <aside
        className={`fixed right-0 top-0 h-full z-50 w-full sm:w-[560px] max-w-[98vw] border-l border-gray-400 transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ 
          backgroundImage: 'url("/clean-gray-paper.png")',
          backgroundSize: 'auto',
          backgroundRepeat: 'repeat',
          backgroundColor: 'var(--color-newsprint)'
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wide" style={{ color: 'var(--color-headline)', fontFamily: 'var(--font-serif)' }}>{texts.sendEmail}</h3>
                <p className="text-xs" style={{ color: '#4b5563' }}>Send message to advertiser</p>
              </div>
              <button
                onClick={closeDialog}
                className="px-3 py-1 text-xs border border-gray-500 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Status Info */}
            {isAuthenticated ? (
              <div className="border border-gray-800 mb-6">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Authentication Status</h4>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-900">You&apos;re logged in as <strong>{userEmail}</strong>. You can send emails directly without OTP verification.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-800 mb-6">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Instructions</h4>
                </div>
                <div className="p-4">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Enter your email and message. We&apos;ll verify your email with an OTP before sending.</p>
                      <p className="text-sm mt-1 text-gray-700">
                        💡 Want to skip OTP verification? 
                        <button 
                          onClick={() => {
                            onOpenAuthDialog?.();
                            onClose();
                          }} 
                          className="text-blue-600 hover:text-blue-800 underline ml-1"
                        >
                          Login here
                        </button> 
                        for a faster experience!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAuthenticated ? (
              // Authenticated user flow - direct email sending
              <div className="border border-gray-800">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Email Details</h4>
                </div>
                <div className="p-4">
                  <form onSubmit={e => { e.preventDefault(); handleAuthenticatedSubmit(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-900">
                          {texts.yourEmail}
                        </label>
                        <input 
                          type="email" 
                          value={fromEmail} 
                          disabled 
                          className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-900">
                          {texts.receiverEmail}
                        </label>
                        <input 
                          type="email" 
                          value={toEmail} 
                          disabled 
                          className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-bold uppercase tracking-wide text-gray-900">
                            {texts.message}
                          </label>
                          <span className={`text-xs ${message.length >= 1000 ? 'text-red-600' : 'text-gray-600'}`}>
                            {message.length}/1000
                          </span>
                        </div>
                        <textarea 
                          required 
                          maxLength={1000}
                          value={message} 
                          onChange={e => setMessage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black min-h-[120px] resize-vertical text-gray-900" 
                          placeholder={texts.messagePlaceholder} 
                        />
                      </div>
                      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>}
                      {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              // Anonymous user flow - OTP verification
              <>
                {step === 'form' && (
                  <div className="border border-gray-800">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Email Details</h4>
                    </div>
                    <div className="p-4">
                      <form onSubmit={e => { e.preventDefault(); handleRequestOtp(); }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-900">
                              {texts.yourEmail}
                            </label>
                            <input 
                              type="email" 
                              required 
                              value={fromEmail} 
                              onChange={e => setFromEmail(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-gray-900" 
                              placeholder={texts.emailPlaceholder} 
                              autoFocus 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-900">
                              {texts.receiverEmail}
                            </label>
                            <input 
                              type="email" 
                              value={toEmail} 
                              disabled 
                              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600" 
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-bold uppercase tracking-wide text-gray-900">
                                {texts.message}
                              </label>
                              <span className={`text-xs ${message.length >= 1000 ? 'text-red-600' : 'text-gray-600'}`}>
                                {message.length}/1000
                              </span>
                            </div>
                            <textarea 
                              required 
                              maxLength={1000}
                              value={message} 
                              onChange={e => setMessage(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black min-h-[120px] resize-vertical text-gray-900" 
                              placeholder={texts.messagePlaceholder} 
                            />
                          </div>
                          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>}
                          {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm">{info}</div>}
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                {step === 'otp' && (
                  <div className="border border-gray-800">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Verify OTP</h4>
                    </div>
                    <div className="p-4">
                      <form onSubmit={e => { e.preventDefault(); handleAnonymousSubmit(); }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-900">
                              {texts.otpPlaceholder}
                            </label>
                            <input 
                              type="text" 
                              required 
                              value={otp} 
                              onChange={e => setOtp(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-gray-900" 
                              placeholder={texts.otpPlaceholder} 
                              autoFocus 
                            />
                          </div>
                          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>}
                          {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm">{info}</div>}
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-5 py-4 border-t border-gray-300 bg-white/60">
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 text-sm border border-gray-500 hover:bg-gray-200 transition-colors"
              >
                {texts.cancel}
              </button>
              {isAuthenticated ? (
                <button 
                  onClick={handleAuthenticatedSubmit}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-black text-white"
                  style={{ backgroundColor: 'var(--color-ink)' }}
                >
                  {loading ? 'Sending Email...' : texts.sendEmail}
                </button>
              ) : (
                <>
                  {step === 'form' && (
                    <button 
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="px-4 py-2 text-sm border border-black text-white"
                      style={{ backgroundColor: 'var(--color-ink)' }}
                    >
                      {loading ? 'Sending OTP...' : texts.requestOtp}
                    </button>
                  )}
                  {step === 'otp' && (
                    <button 
                      onClick={handleAnonymousSubmit}
                      disabled={loading}
                      className="px-4 py-2 text-sm border border-black text-white"
                      style={{ backgroundColor: 'var(--color-ink)' }}
                    >
                      {loading ? 'Sending Email...' : texts.sendEmail}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
} 