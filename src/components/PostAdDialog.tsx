import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useUITexts } from '../hooks/useUITexts';

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

// Color options for background
const bgColorOptions = [
  { name: 'Default White', value: '#ffffff' },
  { name: 'Light Blue', value: '#f0f8ff' },
  { name: 'Light Green', value: '#f0fff0' },
  { name: 'Light Pink', value: '#fff0f5' },
  { name: 'Light Gray', value: '#f8f8ff' },
  { name: 'Light Yellow', value: '#f5f5dc' },
  { name: 'Light Orange', value: '#faf0e6' },
  { name: 'Light Purple', value: '#f8f0ff' },
  { name: 'Light Cyan', value: '#f0ffff' },
  { name: 'Light Salmon', value: '#fff5ee' },
];

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
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [lookingFor, setLookingFor] = useState<'bride' | 'groom'>('bride');
  const [duration, setDuration] = useState<28 | 42 | 56>(28);
  const [characterLimit, setCharacterLimit] = useState(400);
  const [currentCharacters, setCurrentCharacters] = useState(0);
  
  // Update character count when content changes
  useEffect(() => {
    setCurrentCharacters(content.length);
  }, [content]);
  
  // Increase character limit function
  const increaseLimit = () => {
    if (characterLimit < 1000) {
      setCharacterLimit(prev => Math.min(prev + 100, 1000));
    }
  };
  const [fontSize, setFontSize] = useState<'default' | 'medium' | 'large'>('default');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Auto-populate email for authenticated users
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      setEmail(userEmail);
    } else {
      setEmail('');
    }
  }, [open, isAuthenticated, userEmail]);

  const handleRequestOtp = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validateContent(content, characterLimit)) {
      setError(`Content must be between 10 and ${characterLimit} characters`);
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
      setInfo('OTP sent to your email. Please check and enter below.');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // For authenticated users - direct post creation
  const handleAuthenticatedSubmit = async () => {
    if (!validateContent(content, characterLimit)) {
      setError(`Content must be between 10 and ${characterLimit} characters`);
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
          bgColor 
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setInfo('Ad posted successfully and pending approval!');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to post ad';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // For anonymous users - OTP verification
  const handleAnonymousSubmit = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validateContent(content, characterLimit)) {
      setError(`Content must be between 10 and ${characterLimit} characters`);
      return;
    }
    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
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
          bgColor 
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setInfo('Ad posted successfully and pending approval!');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to post ad';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setStep('form'); 
    if (!isAuthenticated) setEmail(''); 
    setContent(''); 
    setLookingFor('bride');
    setDuration(28);
    setCharacterLimit(400);
    setCurrentCharacters(0);
    setFontSize('default');
    setBgColor('#ffffff');
    setOtp(''); 
    setError(''); 
    setInfo('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={closeDialog} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 transition-opacity duration-500" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white border border-gray-300 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
          {/* Header - Newspaper Style */}
          <div className="bg-gray-900 text-white px-6 py-4 border-b-4 border-amber-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-700 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-wide uppercase">{texts.postAd}</h3>
                  <p className="text-xs text-gray-300 uppercase tracking-wider">Create your matrimonial advertisement</p>
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
          <div className="p-6 max-h-[600px] overflow-y-auto bg-gray-50">
            {/* Status Info */}
            {isAuthenticated ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 mb-6 rounded">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">You&apos;re logged in as <strong>{userEmail}</strong>. You can post ads directly without OTP verification.</span>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 mb-6 rounded">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Enter your details and ad content. We&apos;ll verify your email with an OTP before posting.</p>
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
              // Authenticated user flow - direct post creation
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Ad Details</h4>
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
                          value={email} 
                          disabled 
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          Looking For
                        </label>
                        <select value={lookingFor} onChange={e => setLookingFor(e.target.value as 'bride' | 'groom')}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600">
                          <option value="bride">Bride</option>
                          <option value="groom">Groom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          Ad Duration
                        </label>
                        <select value={duration} onChange={e => setDuration(Number(e.target.value) as 28 | 42 | 56)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600">
                          <option value={28}>4 weeks</option>
                          <option value={42}>6 weeks</option>
                          <option value={56}>8 weeks</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          Font Size
                        </label>
                        <select value={fontSize} onChange={e => setFontSize(e.target.value as 'default' | 'medium' | 'large')}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600">
                          <option value="default">Default</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          Background Color
                        </label>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {bgColorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setBgColor(color.value)}
                              className={`p-3 border-2 transition-colors ${
                                bgColor === color.value
                                  ? 'border-amber-700'
                                  : 'border-gray-200 hover:border-amber-500'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            >
                              <span className="sr-only">{color.name}</span>
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Selected: {bgColorOptions.find(c => c.value === bgColor)?.name}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
                            {texts.adContent}
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium ${
                              currentCharacters > characterLimit * 0.9 ? 'text-red-600' : 
                              currentCharacters > characterLimit * 0.7 ? 'text-amber-600' : 'text-gray-500'
                            }`}>
                              {currentCharacters}/{characterLimit} characters
                            </span>
                            {characterLimit < 1000 && (
                              <button
                                type="button"
                                onClick={increaseLimit}
                                className="text-xs bg-amber-700 text-white px-2 py-1 rounded hover:bg-amber-800 transition-colors"
                              >
                                +100 chars
                              </button>
                            )}
                          </div>
                        </div>
                        <textarea 
                          required 
                          value={content} 
                          onChange={e => setContent(e.target.value)}
                          maxLength={characterLimit}
                          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 min-h-[120px] resize-vertical ${
                            currentCharacters > characterLimit * 0.9 ? 'border-red-300 focus:border-red-600 focus:ring-red-600' :
                            currentCharacters > characterLimit * 0.7 ? 'border-amber-300 focus:border-amber-600 focus:ring-amber-600' :
                            'border-gray-300 focus:border-amber-600 focus:ring-amber-600'
                          }`}
                          placeholder={texts.contentPlaceholder} 
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
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Ad Details</h4>
                    </div>
                    <div className="p-4">
                      <form onSubmit={e => { e.preventDefault(); handleRequestOtp(); }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                              {texts.yourEmail}
                            </label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" placeholder={texts.emailPlaceholder} autoFocus />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                              Looking For
                            </label>
                            <select value={lookingFor} onChange={e => setLookingFor(e.target.value as 'bride' | 'groom')}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600">
                              <option value="bride">Bride</option>
                              <option value="groom">Groom</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                              Ad Duration
                            </label>
                            <select value={duration} onChange={e => setDuration(Number(e.target.value) as 28 | 42 | 56)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600">
                              <option value={28}>4 weeks</option>
                              <option value={42}>6 weeks</option>
                              <option value={56}>8 weeks</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                              Font Size
                            </label>
                            <select value={fontSize} onChange={e => setFontSize(e.target.value as 'default' | 'medium' | 'large')}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600">
                              <option value="default">Default</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                              Background Color
                            </label>
                            <div className="grid grid-cols-5 gap-2 mt-2">
                              {bgColorOptions.map((color) => (
                                <button
                                  key={color.value}
                                  type="button"
                                  onClick={() => setBgColor(color.value)}
                                  className={`p-3 border-2 transition-colors ${
                                    bgColor === color.value
                                      ? 'border-amber-700'
                                      : 'border-gray-200 hover:border-amber-500'
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                >
                                  <span className="sr-only">{color.name}</span>
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Selected: {bgColorOptions.find(c => c.value === bgColor)?.name}
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
                                {texts.adContent}
                              </label>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-medium ${
                                  currentCharacters > characterLimit * 0.9 ? 'text-red-600' : 
                                  currentCharacters > characterLimit * 0.7 ? 'text-amber-600' : 'text-gray-500'
                                }`}>
                                  {currentCharacters}/{characterLimit} characters
                                </span>
                                {characterLimit < 1000 && (
                                  <button
                                    type="button"
                                    onClick={increaseLimit}
                                    className="text-xs bg-amber-700 text-white px-2 py-1 rounded hover:bg-amber-800 transition-colors"
                                  >
                                    +100 chars
                                  </button>
                                )}
                              </div>
                            </div>
                            <textarea 
                              required 
                              value={content} 
                              onChange={e => setContent(e.target.value)}
                              maxLength={characterLimit}
                              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 min-h-[120px] resize-vertical ${
                                currentCharacters > characterLimit * 0.9 ? 'border-red-300 focus:border-red-600 focus:ring-red-600' :
                                currentCharacters > characterLimit * 0.7 ? 'border-amber-300 focus:border-amber-600 focus:ring-amber-600' :
                                'border-gray-300 focus:border-amber-600 focus:ring-amber-600'
                              }`}
                              placeholder={texts.contentPlaceholder} 
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
                            <input type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" placeholder={texts.otpPlaceholder} autoFocus />
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
                  {loading ? 'Posting Ad...' : texts.submit}
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
                      {loading ? 'Posting Ad...' : texts.submit}
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