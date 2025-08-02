import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
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
  postId
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
    <Dialog open={open} onClose={closeDialog} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 transition-opacity duration-500" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white border border-gray-300 shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header - Newspaper Style */}
          <div className="bg-gray-900 text-white px-6 py-4 border-b-4 border-amber-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-700 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-wide uppercase">{texts.sendEmail}</h3>
                  <p className="text-xs text-gray-300 uppercase tracking-wider">Send message to advertiser</p>
                </div>
              </div>
              <button
                onClick={closeDialog}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[500px] overflow-y-auto bg-gray-50">
            {/* Status Info */}
            {isAuthenticated ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 mb-6 rounded">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">You&apos;re logged in as <strong>{userEmail}</strong>. You can send emails directly without OTP verification.</span>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 mb-6 rounded">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Enter your email and message. We&apos;ll verify your email with an OTP before sending.</p>
                    <p className="text-sm mt-1">
                      💡 Want to skip OTP verification? 
                      <button 
                        onClick={() => window.location.href = '/#login'} 
                        className="text-blue-600 hover:text-blue-800 underline ml-1"
                      >
                        Login here
                      </button> 
                      for a faster experience!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isAuthenticated ? (
              // Authenticated user flow - direct email sending
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Email Details</h4>
                </div>
                <div className="p-4">
                  <form onSubmit={e => { e.preventDefault(); handleAuthenticatedSubmit(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          {texts.yourEmail}
                        </label>
                        <input 
                          type="email" 
                          value={fromEmail} 
                          disabled 
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          {texts.receiverEmail}
                        </label>
                        <input 
                          type="email" 
                          value={toEmail} 
                          disabled 
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          {texts.message}
                        </label>
                        <textarea 
                          required 
                          value={message} 
                          onChange={e => setMessage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 min-h-[120px] resize-vertical" 
                          placeholder={texts.messagePlaceholder} 
                        />
                      </div>
                      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">{error}</div>}
                      {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              // Anonymous user flow - OTP verification
              <>
                {step === 'form' && (
                  <div className="bg-white border border-gray-300 shadow-sm">
                    <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Email Details</h4>
                    </div>
                    <div className="p-4">
                      <form onSubmit={e => { e.preventDefault(); handleRequestOtp(); }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                              {texts.yourEmail}
                            </label>
                            <input 
                              type="email" 
                              required 
                              value={fromEmail} 
                              onChange={e => setFromEmail(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" 
                              placeholder={texts.emailPlaceholder} 
                              autoFocus 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                              {texts.receiverEmail}
                            </label>
                            <input 
                              type="email" 
                              value={toEmail} 
                              disabled 
                              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                              {texts.message}
                            </label>
                            <textarea 
                              required 
                              value={message} 
                              onChange={e => setMessage(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 min-h-[120px] resize-vertical" 
                              placeholder={texts.messagePlaceholder} 
                            />
                          </div>
                          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">{error}</div>}
                          {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{info}</div>}
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                {step === 'otp' && (
                  <div className="bg-white border border-gray-300 shadow-sm">
                    <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Verify OTP</h4>
                    </div>
                    <div className="p-4">
                      <form onSubmit={e => { e.preventDefault(); handleAnonymousSubmit(); }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                              {texts.otpPlaceholder}
                            </label>
                            <input 
                              type="text" 
                              required 
                              value={otp} 
                              onChange={e => setOtp(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" 
                              placeholder={texts.otpPlaceholder} 
                              autoFocus 
                            />
                          </div>
                          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">{error}</div>}
                          {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{info}</div>}
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Actions - Newspaper Footer */}
          <div className="bg-gray-100 px-6 py-4 border-t border-gray-300">
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded border border-gray-300 hover:bg-gray-200 transition-colors text-sm"
              >
                {texts.cancel}
              </button>
              {isAuthenticated ? (
                <button 
                  onClick={handleAuthenticatedSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-semibold transition-colors text-sm shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Sending Email...' : texts.sendEmail}
                </button>
              ) : (
                <>
                  {step === 'form' && (
                    <button 
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-semibold transition-colors text-sm shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Sending OTP...' : texts.requestOtp}
                    </button>
                  )}
                  {step === 'otp' && (
                    <button 
                      onClick={handleAnonymousSubmit}
                      disabled={loading}
                      className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-semibold transition-colors text-sm shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Sending Email...' : texts.sendEmail}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 