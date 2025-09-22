'use client';

import { useEffect, useState } from 'react';

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'verified' | 'unverified'>('processing');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = {
      payment_link_id: params.get('payment_link_id') || '',
      razorpay_payment_id: params.get('razorpay_payment_id') || '',
      payment_link_reference_id: params.get('payment_link_reference_id') || '',
      payment_link_status: params.get('payment_link_status') || '',
      razorpay_signature: params.get('razorpay_signature') || '',
    };

    // Best-effort verify (non-authoritative). Webhook remains the source of truth.
    const verify = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setStatus(data?.success ? 'verified' : 'unverified');
      } catch {
        setStatus('unverified');
      } finally {
        // Redirect to home (or success page) after a short delay
        setTimeout(() => { window.location.replace('/'); }, 1200);
      }
    };

    // Require core params; if missing, just redirect soon
    if (payload.payment_link_id && payload.razorpay_payment_id && payload.payment_link_reference_id) {
      verify();
    } else {
      setTimeout(() => { window.location.replace('/'); }, 800);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundImage: 'url("/clean-gray-paper.png")', backgroundRepeat: 'repeat' }}>
      <div className="text-center p-6 bg-white/70 border">
        <h1 className="text-xl font-semibold text-gray-900">Processing payment...</h1>
        <p className="text-gray-700 mt-2">
          {status === 'processing' && 'Please wait while we confirm your payment.'}
          {status === 'verified' && 'Payment verified! Redirecting...'}
          {status === 'unverified' && 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}


