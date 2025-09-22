"use client";
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useUITexts } from '../hooks/useUITexts';
import { useToast } from './ToastContext';

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
  const { showSuccess, showError, showInfo } = useToast();
  const [mode, setMode] = useState<Mode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
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
    setConfirmNewPassword('');
    setError(''); 
    setInfo('');
    onClose();
  };

  // Register flow
  const handleRequestOtp = async () => {
    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      showError('Invalid Email', errorMsg);
      return;
    }
    if (!validatePassword(password)) {
      const errorMsg = 'Password must be at least 8 characters long';
      setError(errorMsg);
      showError('Invalid Password', errorMsg);
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

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      showError('Invalid Email', errorMsg);
      return;
    }
    if (!validatePassword(password)) {
      const errorMsg = 'Password must be at least 8 characters long';
      setError(errorMsg);
      showError('Invalid Password', errorMsg);
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
      const res = await fetch(`${API_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      const successMsg = 'Registration successful! You can now log in.';
      setInfo(successMsg);
      showSuccess('Registration Successful', 'You can now log in with your credentials');
      setTimeout(() => { setMode('login'); setStep('form'); setError(''); setInfo(''); }, 1200);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to register';
      setError(errorMessage);
      showError('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login flow - Password method
  const handleLogin = async () => {
    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      showError('Invalid Email', errorMsg);
      return;
    }
    if (!password.trim()) {
      const errorMsg = 'Please enter your password';
      setError(errorMsg);
      showError('Missing Password', errorMsg);
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
      const successMsg = 'Login successful!';
      setInfo(successMsg);
      showSuccess('Login Successful', 'Welcome back!');
      onAuth(data.token, data.email);
      setTimeout(() => { closeDialog(); }, 800);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to login';
      setError(errorMessage);
      showError('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login flow - OTP method
  const handleRequestLoginOtp = async () => {
    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      showError('Invalid Email', errorMsg);
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
      const successMsg = 'Login OTP sent to your email. Please check and enter below.';
      setInfo(successMsg);
      showSuccess('Login OTP Sent', 'Check your email for the verification code');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to send OTP';
      setError(errorMessage);
      showError('OTP Request Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async () => {
    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      showError('Invalid Email', errorMsg);
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
      const res = await fetch(`${API_URL}/user/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      const successMsg = 'Login successful!';
      setInfo(successMsg);
      showSuccess('Login Successful', 'Welcome back!');
      onAuth(data.token, data.email);
      setTimeout(() => { closeDialog(); }, 800);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to login';
      setError(errorMessage);
      showError('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Password reset flow
  const handleRequestOtpReset = async () => {
    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      showError('Invalid Email', errorMsg);
      return;
    }
    if (!validatePassword(newPassword)) {
      const errorMsg = 'Password must be at least 8 characters long';
      setError(errorMsg);
      showError('Invalid Password', errorMsg);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      showError('Password Mismatch', errorMsg);
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

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      showError('Invalid Email', errorMsg);
      return;
    }
    if (!validateOTP(otp)) {
      const errorMsg = 'Please enter a valid 6-digit OTP';
      setError(errorMsg);
      showError('Invalid OTP', errorMsg);
      return;
    }
    if (!validatePassword(newPassword)) {
      const errorMsg = 'Password must be at least 8 characters long';
      setError(errorMsg);
      showError('Invalid Password', errorMsg);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      showError('Password Mismatch', errorMsg);
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
      const successMsg = 'Password reset! You can now log in.';
      setInfo(successMsg);
      showSuccess('Password Reset Successful', 'You can now log in with your new password');
      setTimeout(() => { setMode('login'); setStep('form'); setError(''); setInfo(''); }, 1200);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to reset password';
      setError(errorMessage);
      showError('Password Reset Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={closeDialog} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 transition-opacity duration-300" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
        <Dialog.Panel 
          className="w-full max-w-md max-h-[90vh] overflow-hidden border"
          style={{
            backgroundColor: 'var(--color-newsprint)',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/clean-gray-paper.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto',
            borderColor: 'var(--color-ink)'
          }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b-2" style={{ borderColor: 'var(--color-ink)' }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wide" style={{ color: 'var(--color-headline)', fontFamily: 'var(--font-serif)' }}>User Authentication</h3>
                <p className="text-xs" style={{ color: '#4b5563' }}>Login, Register, or Reset Password</p>
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
          <div className="p-5 max-h-[60vh] overflow-y-auto">
            {/* Mode Tabs */}
            <div className="border border-gray-300 mb-4">
              <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Select Action</h4>
              </div>
              <div className="p-4 bg-white/70">
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    className={`px-3 py-2 text-sm font-medium border transition-colors ${
                      mode === 'login' 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                    }`}
                    onClick={() => { setMode('login'); setStep('form'); setError(''); setInfo(''); }}
                  >
                    {texts.login}
                  </button>
                  <button 
                    className={`px-3 py-2 text-sm font-medium border transition-colors ${
                      mode === 'register' 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                    }`}
                    onClick={() => { setMode('register'); setStep('form'); setError(''); setInfo(''); }}
                  >
                    {texts.register}
                  </button>
                  <button 
                    className={`px-3 py-2 text-sm font-medium border transition-colors ${
                      mode === 'reset' 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                    }`}
                    onClick={() => { setMode('reset'); setStep('form'); setError(''); setInfo(''); }}
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
            
            {mode === 'login' && step === 'form' && (
              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Login Method</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <div className="flex gap-2 mb-4">
                    <button 
                      className={`px-3 py-2 text-sm font-medium border transition-colors ${
                        loginMethod === 'password' 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                      }`} 
                      onClick={() => { setLoginMethod('password'); setError(''); setInfo(''); }}
                    >
                      Login with Password
                    </button>
                    <button 
                      className={`px-3 py-2 text-sm font-medium border transition-colors ${
                        loginMethod === 'otp' 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
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
                          <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                            {texts.yourEmail}
                          </label>
                          <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" 
                            placeholder={texts.emailPlaceholder} 
                            autoFocus 
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                            title="Please enter a valid email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                            {texts.password}
                          </label>
                          <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" 
                            placeholder={texts.passwordPlaceholder} 
                            minLength={8}
                            title="Password must be at least 8 characters long"
                          />
                        </div>
                        {error && <div className="p-3 border border-red-200 text-red-800 text-sm">{error}</div>}
                        {info && <div className="p-3 border border-green-200 text-green-800 text-sm">{info}</div>}
                      </div>
                    </form>
                  )}
                  
                  {loginMethod === 'otp' && (
                    <form onSubmit={e => { e.preventDefault(); handleRequestLoginOtp(); }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                            {texts.yourEmail}
                          </label>
                          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" placeholder={texts.emailPlaceholder} autoFocus />
                        </div>
                        {error && <div className="p-3 border border-red-200 text-red-800 text-sm">{error}</div>}
                        {info && <div className="p-3 border border-green-200 text-green-800 text-sm">{info}</div>}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
            
            {mode === 'login' && step === 'otp' && (
              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Enter OTP</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <form onSubmit={e => { e.preventDefault(); handleVerifyLoginOtp(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                          {texts.otpPlaceholder}
                        </label>
                        <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" placeholder={texts.otpPlaceholder} autoFocus />
                      </div>
                      {error && <div className="p-3 border border-red-200 text-red-800 text-sm">{error}</div>}
                      {info && <div className="p-3 border border-green-200 text-green-800 text-sm">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {mode === 'register' && step === 'form' && (
              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Registration Details</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <form onSubmit={e => { e.preventDefault(); handleRequestOtp(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                          {texts.yourEmail}
                        </label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" placeholder={texts.emailPlaceholder} autoFocus />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                          {texts.password}
                        </label>
                        <input 
                          type="password" 
                          required 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" 
                          placeholder={texts.passwordPlaceholder} 
                          minLength={8}
                          title="Password must be at least 8 characters long"
                        />
                      </div>
                      {error && <div className="p-3 border border-red-200 text-red-800 text-sm">{error}</div>}
                      {info && <div className="p-3 border border-green-200 text-green-800 text-sm">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            )}
            {mode === 'register' && step === 'otp' && (
              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Verify OTP</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <form onSubmit={e => { e.preventDefault(); handleRegister(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                          {texts.otpPlaceholder}
                        </label>
                        <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" placeholder={texts.otpPlaceholder} autoFocus />
                      </div>
                      {error && <div className="p-3 border border-red-200 text-red-800 text-sm">{error}</div>}
                      {info && <div className="p-3 border border-green-200 text-green-800 text-sm">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            )}
            {mode === 'reset' && step === 'form' && (
              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Reset Password</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <form onSubmit={e => { e.preventDefault(); handleRequestOtpReset(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                          {texts.yourEmail}
                        </label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" placeholder={texts.emailPlaceholder} autoFocus />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>{texts.newPassword}</label>
                        <input 
                          type="password" 
                          required 
                          value={newPassword} 
                          onChange={e => setNewPassword(e.target.value)} 
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" 
                          placeholder={texts.newPasswordPlaceholder} 
                          minLength={8}
                          title="Password must be at least 8 characters long"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>{texts.confirmNewPassword}</label>
                        <input 
                          type="password" 
                          required 
                          value={confirmNewPassword} 
                          onChange={e => setConfirmNewPassword(e.target.value)} 
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" 
                          placeholder={texts.confirmNewPasswordPlaceholder} 
                          minLength={8}
                          title="Please re-enter your new password"
                        />
                      </div>
                      {error && <div className="p-3 border border-red-200 text-red-800 text-sm">{error}</div>}
                      {info && <div className="p-3 border border-green-200 text-green-800 text-sm">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            )}
            {mode === 'reset' && step === 'otp' && (
              <div className="border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>Verify OTP</h4>
                </div>
                <div className="p-4 bg-white/70">
                  <form onSubmit={e => { e.preventDefault(); handleResetPassword(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                          {texts.otpPlaceholder}
                        </label>
                        <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black" placeholder={texts.otpPlaceholder} autoFocus />
                      </div>
                      {error && <div className="p-3 border border-red-200 text-red-800 text-sm">{error}</div>}
                      {info && <div className="p-3 border border-green-200 text-green-800 text-sm">{info}</div>}
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-4 border-t border-gray-300">
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 text-sm border border-gray-500 hover:bg-gray-200 transition-colors"
              >
                {texts.cancel}
              </button>
              {mode === 'login' && step === 'form' && loginMethod === 'password' && (
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-black text-white"
                  style={{ backgroundColor: 'var(--color-ink)' }}
                >
                  {loading ? 'Logging in...' : texts.login}
                </button>
              )}
              {mode === 'login' && step === 'form' && loginMethod === 'otp' && (
                <button
                  onClick={handleRequestLoginOtp}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-black text-white"
                  style={{ backgroundColor: 'var(--color-ink)' }}
                >
                  {loading ? 'Sending OTP...' : 'Send Login OTP'}
                </button>
              )}
              {mode === 'login' && step === 'otp' && (
                <button
                  onClick={handleVerifyLoginOtp}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-black text-white"
                  style={{ backgroundColor: 'var(--color-ink)' }}
                >
                  {loading ? 'Logging in...' : texts.login}
                </button>
              )}
              {mode === 'register' && step === 'form' && (
                <button
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-black text-white"
                  style={{ backgroundColor: 'var(--color-ink)' }}
                >
                  {loading ? 'Sending OTP...' : texts.requestOtp}
                </button>
              )}
              {mode === 'register' && step === 'otp' && (
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-black text-white"
                  style={{ backgroundColor: 'var(--color-ink)' }}
                >
                  {loading ? 'Registering...' : texts.register}
                </button>
              )}
              {mode === 'reset' && step === 'form' && (
                <button
                  onClick={handleRequestOtpReset}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-black text-white"
                  style={{ backgroundColor: 'var(--color-ink)' }}
                >
                  {loading ? 'Sending OTP...' : texts.requestOtp}
                </button>
              )}
              {mode === 'reset' && step === 'otp' && (
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-black text-white"
                  style={{ backgroundColor: 'var(--color-ink)' }}
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