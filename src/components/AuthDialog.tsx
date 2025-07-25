"use client";
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useUITexts } from '../hooks/useUITexts';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

type Mode = 'login' | 'register' | 'reset';
type LoginMethod = 'password' | 'otp';

export default function AuthDialog({ open, onClose, onAuth }: {
  open: boolean;
  onClose: () => void;
  onAuth: (token: string) => void;
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
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
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
    } catch (e: any) {
      setError(e.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  // Login flow - Password method
  const handleLogin = async () => {
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
      onAuth(data.token);
      setTimeout(() => { closeDialog(); }, 800);
    } catch (e: any) {
      setError(e.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // Login flow - OTP method
  const handleRequestLoginOtp = async () => {
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
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async () => {
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
      onAuth(data.token);
      setTimeout(() => { closeDialog(); }, 800);
    } catch (e: any) {
      setError(e.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // Password reset flow
  const handleRequestOtpReset = async () => {
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
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
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
    } catch (e: any) {
      setError(e.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={closeDialog} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 transition-opacity duration-500" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded shadow-lg max-w-md w-full p-6 transition-all duration-500">
          <Dialog.Title className="text-xl font-bold mb-2 ui-font">
            {mode === 'login' ? texts.login : mode === 'register' ? texts.register : 'Reset Password'}
          </Dialog.Title>
          <div className="flex gap-4 mb-4">
            <button className={`ui-font px-2 py-1 rounded ${mode === 'login' ? 'bg-black text-white' : 'bg-gray-100'}`} onClick={() => { setMode('login'); setStep('form'); setError(''); setInfo(''); }}>{texts.login}</button>
            <button className={`ui-font px-2 py-1 rounded ${mode === 'register' ? 'bg-black text-white' : 'bg-gray-100'}`} onClick={() => { setMode('register'); setStep('form'); setError(''); setInfo(''); }}>{texts.register}</button>
            <button className={`ui-font px-2 py-1 rounded ${mode === 'reset' ? 'bg-black text-white' : 'bg-gray-100'}`} onClick={() => { setMode('reset'); setStep('form'); setError(''); setInfo(''); }}>Reset Password</button>
          </div>
          
          {mode === 'login' && step === 'form' && (
            <>
              <div className="flex gap-2 mb-4">
                <button 
                  className={`ui-font px-3 py-1 rounded text-sm ${loginMethod === 'password' ? 'bg-black text-white' : 'bg-gray-100'}`} 
                  onClick={() => { setLoginMethod('password'); setError(''); setInfo(''); }}
                >
                  Login with Password
                </button>
                <button 
                  className={`ui-font px-3 py-1 rounded text-sm ${loginMethod === 'otp' ? 'bg-black text-white' : 'bg-gray-100'}`} 
                  onClick={() => { setLoginMethod('otp'); setError(''); setInfo(''); }}
                >
                  Login with OTP
                </button>
              </div>
              
              {loginMethod === 'password' && (
                <form onSubmit={e => { e.preventDefault(); handleLogin(); }}>
                  <label className="block mb-2">
                    <span className="ui-font font-medium">{texts.yourEmail}</span>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.emailPlaceholder} autoFocus />
                  </label>
                  <label className="block mb-2">
                    <span className="ui-font font-medium">{texts.password}</span>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.passwordPlaceholder} />
                  </label>
                  {error && <div className="text-red-600 mb-2">{error}</div>}
                  {info && <div className="text-green-700 mb-2">{info}</div>}
                  <button type="submit" className="ui-font bg-black text-white px-4 py-2 rounded w-full mt-2" disabled={loading}>
                    {loading ? 'Logging in...' : texts.login}
                  </button>
                </form>
              )}
              
              {loginMethod === 'otp' && (
                <form onSubmit={e => { e.preventDefault(); handleRequestLoginOtp(); }}>
                  <label className="block mb-2">
                    <span className="ui-font font-medium">{texts.yourEmail}</span>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.emailPlaceholder} autoFocus />
                  </label>
                  {error && <div className="text-red-600 mb-2">{error}</div>}
                  {info && <div className="text-green-700 mb-2">{info}</div>}
                  <button type="submit" className="ui-font bg-black text-white px-4 py-2 rounded w-full mt-2" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Send Login OTP'}
                  </button>
                </form>
              )}
            </>
          )}
          
          {mode === 'login' && step === 'otp' && (
            <form onSubmit={e => { e.preventDefault(); handleVerifyLoginOtp(); }}>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.otpPlaceholder}</span>
                <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.otpPlaceholder} autoFocus />
              </label>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {info && <div className="text-green-700 mb-2">{info}</div>}
              <button type="submit" className="ui-font bg-black text-white px-4 py-2 rounded w-full mt-2" disabled={loading}>
                {loading ? 'Logging in...' : texts.login}
              </button>
            </form>
          )}

          {mode === 'register' && step === 'form' && (
            <form onSubmit={e => { e.preventDefault(); handleRequestOtp(); }}>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.yourEmail}</span>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.emailPlaceholder} autoFocus />
              </label>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.password}</span>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.passwordPlaceholder} />
              </label>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {info && <div className="text-green-700 mb-2">{info}</div>}
              <button type="submit" className="ui-font bg-black text-white px-4 py-2 rounded w-full mt-2" disabled={loading}>
                {loading ? 'Sending OTP...' : texts.requestOtp}
              </button>
            </form>
          )}
          {mode === 'register' && step === 'otp' && (
            <form onSubmit={e => { e.preventDefault(); handleRegister(); }}>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.otpPlaceholder}</span>
                <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.otpPlaceholder} autoFocus />
              </label>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {info && <div className="text-green-700 mb-2">{info}</div>}
              <button type="submit" className="ui-font bg-black text-white px-4 py-2 rounded w-full mt-2" disabled={loading}>
                {loading ? 'Registering...' : texts.register}
              </button>
            </form>
          )}
          {mode === 'reset' && step === 'form' && (
            <form onSubmit={e => { e.preventDefault(); handleRequestOtpReset(); }}>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.yourEmail}</span>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.emailPlaceholder} autoFocus />
              </label>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.confirmPassword}</span>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.confirmPasswordPlaceholder} />
              </label>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {info && <div className="text-green-700 mb-2">{info}</div>}
              <button type="submit" className="ui-font bg-black text-white px-4 py-2 rounded w-full mt-2" disabled={loading}>
                {loading ? 'Sending OTP...' : texts.requestOtp}
              </button>
            </form>
          )}
          {mode === 'reset' && step === 'otp' && (
            <form onSubmit={e => { e.preventDefault(); handleResetPassword(); }}>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.otpPlaceholder}</span>
                <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.otpPlaceholder} autoFocus />
              </label>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {info && <div className="text-green-700 mb-2">{info}</div>}
              <button type="submit" className="ui-font bg-black text-white px-4 py-2 rounded w-full mt-2" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          <button onClick={closeDialog} className="ui-font mt-4 text-gray-500 hover:text-black w-full text-center text-sm">{texts.cancel}</button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 