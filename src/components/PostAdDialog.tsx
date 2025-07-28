import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useUITexts } from '../hooks/useUITexts';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

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

export default function PostAdDialog({ open, onClose, onSuccess }: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { texts } = useUITexts();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [lookingFor, setLookingFor] = useState<'bride' | 'groom'>('bride');
  const [duration, setDuration] = useState<15 | 20 | 25>(20);
  const [fontSize, setFontSize] = useState<'default' | 'medium' | 'large'>('default');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

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
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
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
    setEmail(''); 
    setContent(''); 
    setLookingFor('bride');
    setDuration(20);
    setFontSize('default');
    setBgColor('#ffffff');
    setOtp(''); 
    setError(''); 
    setInfo('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={closeDialog} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 transition-opacity duration-500" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded shadow-lg max-w-lg w-full p-6 transition-all duration-500 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-2 ui-font">{texts.postAd}</Dialog.Title>
          <div className="text-sm text-gray-600 mb-4">Enter your details and ad content. We&apos;ll verify your email with an OTP before posting.</div>
          {step === 'form' && (
            <form onSubmit={e => { e.preventDefault(); handleRequestOtp(); }}>
              <label className="block mb-3">
                <span className="ui-font font-medium">{texts.yourEmail}</span>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="block w-full border rounded px-2 py-1 mt-1 placeholder:text-gray-600 text-black" placeholder={texts.emailPlaceholder} autoFocus />
              </label>
              
              <label className="block mb-3">
                <span className="ui-font font-medium">Looking For</span>
                <select value={lookingFor} onChange={e => setLookingFor(e.target.value as 'bride' | 'groom')}
                  className="block w-full border rounded px-2 py-1 mt-1">
                  <option value="bride">Bride</option>
                  <option value="groom">Groom</option>
                </select>
              </label>

              <label className="block mb-3">
                <span className="ui-font font-medium">Ad Duration</span>
                <select value={duration} onChange={e => setDuration(Number(e.target.value) as 15 | 20 | 25)}
                  className="block w-full border rounded px-2 py-1 mt-1">
                  <option value={15}>15 days</option>
                  <option value={20}>20 days</option>
                  <option value={25}>25 days</option>
                </select>
              </label>

              <label className="block mb-3">
                <span className="ui-font font-medium">Font Size</span>
                <select value={fontSize} onChange={e => setFontSize(e.target.value as 'default' | 'medium' | 'large')}
                  className="block w-full border rounded px-2 py-1 mt-1">
                  <option value="default">Default</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>

              <label className="block mb-3">
                <span className="ui-font font-medium">Background Color</span>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {bgColorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setBgColor(color.value)}
                      className={`p-3 rounded-md border-2 transition-colors ${
                        bgColor === color.value
                          ? 'border-black'
                          : 'border-gray-200 hover:border-gray-300'
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
              </label>

              <label className="block mb-3">
                <span className="ui-font font-medium">{texts.adContent}</span>
                <textarea required value={content} onChange={e => setContent(e.target.value)}
                  className="block w-full border rounded px-2 py-1 mt-1 min-h-[80px] placeholder:text-gray-600 text-black" 
                  placeholder={texts.contentPlaceholder} />
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
                  className="block w-full border rounded px-2 py-1 mt-1 mb-3 placeholder:text-gray-600 text-black" placeholder={texts.otpPlaceholder} autoFocus />
              </label>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {info && <div className="text-green-700 mb-2">{info}</div>}
              <button type="submit" className="ui-font bg-black text-white px-4 py-2 rounded w-full mt-2" disabled={loading}>
                {loading ? 'Posting Ad...' : texts.submit}
              </button>
            </form>
          )}
          <button onClick={closeDialog} className="ui-font mt-4 text-gray-500 hover:text-black w-full text-center text-sm">{texts.cancel}</button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 