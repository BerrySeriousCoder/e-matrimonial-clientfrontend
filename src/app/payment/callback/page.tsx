'use client';

import { useEffect, useState } from 'react';

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

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
        setStatus(data?.success ? 'success' : 'failed');
      } catch {
        setStatus('failed');
      } finally {
        // Give the user a moment to read the result before redirecting
        setTimeout(() => { window.location.replace('/'); }, 1800);
      }
    };

    // Require core params; if missing, just redirect soon
    if (payload.payment_link_id && payload.razorpay_payment_id && payload.payment_link_reference_id) {
      // Show processing for a short beat for better UX
      setTimeout(verify, 400);
    } else {
      setTimeout(() => { window.location.replace('/'); }, 800);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundImage: 'url("/clean-gray-paper.png")', backgroundRepeat: 'repeat' }}>
      <div className="text-center p-6 bg-white/80 border">
        {status === 'processing' && (
          <>
            <h1 className="text-xl font-semibold text-gray-900">Checking payment...</h1>
            <p className="text-gray-700 mt-2">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-xl font-semibold text-green-700">Payment successful</h1>
            <p className="text-gray-700 mt-2">Redirecting to home...</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <h1 className="text-xl font-semibold text-red-700">Payment status pending</h1>
            <p className="text-gray-700 mt-2">We’ll finalize shortly. Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}


