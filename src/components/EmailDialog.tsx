import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useUITexts } from '../hooks/useUITexts';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function EmailDialog({ open, onClose, toEmail, lastMsg, setLastMsg }: {
  open: boolean;
  onClose: () => void;
  toEmail: string;
  lastMsg: string;
  setLastMsg: (msg: string) => void;
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
  }, [lastMsg, open]);

  const handleRequestOtp = async () => {
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
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_URL}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromEmail, toEmail, message, otp }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setInfo('Email sent successfully!');
      setLastMsg(message);
      setTimeout(() => { onClose(); }, 1200);
    } catch (e: any) {
      setError(e.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setStep('form'); setFromEmail(''); setOtp(''); setError(''); setInfo('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={closeDialog} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 transition-opacity duration-500" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded shadow-lg max-w-md w-full p-6 transition-all duration-500">
          <Dialog.Title className="text-xl font-bold mb-2 ui-font">{texts.sendEmail}</Dialog.Title>
          <div className="text-sm text-gray-600 mb-4">Enter your email and message. We'll verify your email with an OTP before sending.</div>
          {step === 'form' && (
            <form onSubmit={e => { e.preventDefault(); handleRequestOtp(); }}>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.yourEmail}</span>
                <input type="email" required value={fromEmail} onChange={e => setFromEmail(e.target.value)}
                  className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.emailPlaceholder} autoFocus />
              </label>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.receiverEmail}</span>
                <input type="email" value={toEmail} disabled className="block w-full border rounded px-2 py-1 mt-1 mb-3 bg-gray-100" />
              </label>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.message}</span>
                <textarea required value={message} onChange={e => setMessage(e.target.value)}
                  className="block w-full border rounded px-2 py-1 mt-1 mb-3 min-h-[80px]" placeholder={texts.messagePlaceholder} />
              </label>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {info && <div className="text-green-700 mb-2">{info}</div>}
              <button type="submit" className="ui-font bg-black text-white px-4 py-2 rounded w-full mt-2" disabled={loading}>
                {loading ? 'Sending OTP...' : texts.requestOtp}
              </button>
            </form>
          )}
          {step === 'otp' && (
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
              <label className="block mb-2">
                <span className="ui-font font-medium">{texts.otpPlaceholder}</span>
                <input type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                  className="block w-full border rounded px-2 py-1 mt-1 mb-3" placeholder={texts.otpPlaceholder} autoFocus />
              </label>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {info && <div className="text-green-700 mb-2">{info}</div>}
              <button type="submit" className="ui-font bg-black text-white px-4 py-2 rounded w-full mt-2" disabled={loading}>
                {loading ? 'Sending Email...' : texts.sendEmail}
              </button>
            </form>
          )}
          <button onClick={closeDialog} className="ui-font mt-4 text-gray-500 hover:text-black w-full text-center text-sm">{texts.cancel}</button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 