"use client";
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useUITexts } from '../hooks/useUITexts';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

type Mode = 'login' | 'register' | 'reset';
type LoginMethod = 'password' | 'otp';

// Simple validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export default function AuthDialog({ open, onClose, onAuth }: {
  open: boolean;
  onClose: () => void;
  onAuth: (token: string, email: string) => void;
}) {
  const { texts } = useUITexts();
  const [mode, setMode] = useState<Mode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const closeDialog = () => {
    setMode('login'); 
    setLoginMethod('password');
    setStep('form'); 
    setEmail(''); 
    setPassword(''); 
    setOtp(''); 
    setNewPassword(''); 
    setError(''); 
    setInfo('');
    onClose();
  };

  // Register flow
  const handleRequestOtp = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long');
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

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setInfo('Registration successful! You can now log in.');
      setTimeout(() => { setMode('login'); setStep('form'); setError(''); setInfo(''); }, 1200);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to register';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login flow - Password method
  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setInfo('Login successful!');
      onAuth(data.token, data.email);
      setTimeout(() => { closeDialog(); }, 800);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login flow - OTP method
  const handleRequestLoginOtp = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/user/login-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStep('otp');
      setInfo('Login OTP sent to your email. Please check and enter below.');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/user/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setInfo('Login successful!');
      onAuth(data.token, data.email);
      setTimeout(() => { closeDialog(); }, 800);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Password reset flow
  const handleRequestOtpReset = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters long');
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

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setInfo('Password reset! You can now log in.');
      setTimeout(() => { setMode('login'); setStep('form'); setError(''); setInfo(''); }, 1200);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-wide uppercase">User Authentication</h3>
                  <p className="text-xs text-gray-300 uppercase tracking-wider">Login, Register, or Reset Password</p>
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
            {/* Mode Tabs - Newspaper Style */}
            <div className="bg-white border border-gray-300 shadow-sm mb-6">
              <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Select Action</h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    className={`px-3 py-2 text-sm font-medium rounded border transition-all duration-200 ${
                      mode === 'login' 
                        ? 'bg-amber-700 text-white border-amber-700' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-amber-500 hover:bg-amber-50'
                    }`}
                    onClick={() => { setMode('login'); setStep('form'); setError(''); setInfo(''); }}
                  >
                    {texts.login}
                  </button>
                  <button 
                    className={`px-3 py-2 text-sm font-medium rounded border transition-all duration-200 ${
                      mode === 'register' 
                        ? 'bg-amber-700 text-white border-amber-700' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-amber-500 hover:bg-amber-50'
                    }`}
                    onClick={() => { setMode('register'); setStep('form'); setError(''); setInfo(''); }}
                  >
                    {texts.register}
                  </button>
                  <button 
                    className={`px-3 py-2 text-sm font-medium rounded border transition-all duration-200 ${
                      mode === 'reset' 
                        ? 'bg-amber-700 text-white border-amber-700' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-amber-500 hover:bg-amber-50'
                    }`}
                    onClick={() => { setMode('reset'); setStep('form'); setError(''); setInfo(''); }}
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
            
            {mode === 'login' && step === 'form' && (
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Login Method</h4>
                </div>
                <div className="p-4">
                  <div className="flex gap-2 mb-4">
                    <button 
                      className={`px-3 py-2 text-sm font-medium rounded border transition-all duration-200 ${
                        loginMethod === 'password' 
                          ? 'bg-amber-700 text-white border-amber-700' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-amber-500 hover:bg-amber-50'
                      }`} 
                      onClick={() => { setLoginMethod('password'); setError(''); setInfo(''); }}
                    >
                      Login with Password
                    </button>
                    <button 
                      className={`px-3 py-2 text-sm font-medium rounded border transition-all duration-200 ${
                        loginMethod === 'otp' 
                          ? 'bg-amber-700 text-white border-amber-700' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-amber-500 hover:bg-amber-50'
                      }`} 
                      onClick={() => { setLoginMethod('otp'); setError(''); setInfo(''); }}
                    >
                      Login with OTP
                    </button>
                  </div>
                  
                  {loginMethod === 'password' && (
                    <form onSubmit={e => { e.preventDefault(); handleLogin(); }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                            {texts.yourEmail}
                          </label>
                          <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" 
                            placeholder={texts.emailPlaceholder} 
                            autoFocus 
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                            title="Please enter a valid email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                            {texts.password}
                          </label>
                          <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" 
                            placeholder={texts.passwordPlaceholder} 
                            minLength={8}
                            title="Password must be at least 8 characters long"
                          />
                        </div>
                        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">{error}</div>}
                        {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{info}</div>}
                      </div>
                    </form>
                  )}
                  
                  {loginMethod === 'otp' && (
                    <form onSubmit={e => { e.preventDefault(); handleRequestLoginOtp(); }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                            {texts.yourEmail}
                          </label>
                          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" placeholder={texts.emailPlaceholder} autoFocus />
                        </div>
                        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">{error}</div>}
                        {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{info}</div>}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
            
            {mode === 'login' && step === 'otp' && (
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Enter OTP</h4>
                </div>
                <div className="p-4">
                  <form onSubmit={e => { e.preventDefault(); handleVerifyLoginOtp(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          {texts.otpPlaceholder}
                        </label>
                        <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" placeholder={texts.otpPlaceholder} autoFocus />
                      </div>
                      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">{error}</div>}
                      {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {mode === 'register' && step === 'form' && (
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Registration Details</h4>
                </div>
                <div className="p-4">
                  <form onSubmit={e => { e.preventDefault(); handleRequestOtp(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          {texts.yourEmail}
                        </label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" placeholder={texts.emailPlaceholder} autoFocus />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          {texts.password}
                        </label>
                        <input 
                          type="password" 
                          required 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" 
                          placeholder={texts.passwordPlaceholder} 
                          minLength={8}
                          title="Password must be at least 8 characters long"
                        />
                      </div>
                      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">{error}</div>}
                      {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            )}
            {mode === 'register' && step === 'otp' && (
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Verify OTP</h4>
                </div>
                <div className="p-4">
                  <form onSubmit={e => { e.preventDefault(); handleRegister(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          {texts.otpPlaceholder}
                        </label>
                        <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" placeholder={texts.otpPlaceholder} autoFocus />
                      </div>
                      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">{error}</div>}
                      {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            )}
            {mode === 'reset' && step === 'form' && (
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Reset Password</h4>
                </div>
                <div className="p-4">
                  <form onSubmit={e => { e.preventDefault(); handleRequestOtpReset(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          {texts.yourEmail}
                        </label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" placeholder={texts.emailPlaceholder} autoFocus />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          {texts.confirmPassword}
                        </label>
                        <input 
                          type="password" 
                          required 
                          value={newPassword} 
                          onChange={e => setNewPassword(e.target.value)} 
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" 
                          placeholder={texts.confirmPasswordPlaceholder} 
                          minLength={8}
                          title="Password must be at least 8 characters long"
                        />
                      </div>
                      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">{error}</div>}
                      {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            )}
            {mode === 'reset' && step === 'otp' && (
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Verify OTP</h4>
                </div>
                <div className="p-4">
                  <form onSubmit={e => { e.preventDefault(); handleResetPassword(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                          {texts.otpPlaceholder}
                        </label>
                        <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600" placeholder={texts.otpPlaceholder} autoFocus />
                      </div>
                      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">{error}</div>}
                      {info && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
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
              {mode === 'login' && step === 'form' && loginMethod === 'password' && (
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-semibold transition-colors text-sm shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : texts.login}
                </button>
              )}
              {mode === 'login' && step === 'form' && loginMethod === 'otp' && (
                <button
                  onClick={handleRequestLoginOtp}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-semibold transition-colors text-sm shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Send Login OTP'}
                </button>
              )}
              {mode === 'login' && step === 'otp' && (
                <button
                  onClick={handleVerifyLoginOtp}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-semibold transition-colors text-sm shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : texts.login}
                </button>
              )}
              {mode === 'register' && step === 'form' && (
                <button
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-semibold transition-colors text-sm shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : texts.requestOtp}
                </button>
              )}
              {mode === 'register' && step === 'otp' && (
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-semibold transition-colors text-sm shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Registering...' : texts.register}
                </button>
              )}
              {mode === 'reset' && step === 'form' && (
                <button
                  onClick={handleRequestOtpReset}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-semibold transition-colors text-sm shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : texts.requestOtp}
                </button>
              )}
              {mode === 'reset' && step === 'otp' && (
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-semibold transition-colors text-sm shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 