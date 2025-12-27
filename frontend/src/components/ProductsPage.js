import React, { useEffect, useMemo, useState } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/api';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ProductsPage() {
  const [notice, setNotice] = useState(null);
  const [payingKey, setPayingKey] = useState(null);

  // Minimal starter set of products (placeholder until DB/products module is built)
  const products = useMemo(
    () => [
      {
        key: 'starter',
        title: 'Starter Support',
        description: 'Minimal paid product to validate payment gateway flow.',
        amountInr: 1
      }
    ],
    []
  );

  useEffect(() => {
    // Preload checkout for faster UX
    loadRazorpayScript();
  }, []);

  const handlePay = async (product) => {
    setNotice(null);
    setPayingKey(product.key);

    try {
      const ok = await loadRazorpayScript();
      if (!ok) {
        setNotice({ type: 'error', message: 'Failed to load payment gateway script. Please try again.' });
        return;
      }

      // Amount in paise
      const amount = Math.round(Number(product.amountInr) * 100);
      const orderResp = await createRazorpayOrder({
        amount,
        currency: 'INR',
        receipt: `prod_${product.key}_${Date.now()}`
      });

      const { keyId, orderId, amount: orderAmount, currency } = orderResp.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount: orderAmount,
        currency,
        name: 'lladlad',
        description: product.title,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Minimal server-side verification (recommended)
            const verifyResp = await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            if (verifyResp?.data?.verified) {
              setNotice({ type: 'success', message: 'Payment successful (verified). Thank you!' });
            } else {
              setNotice({ type: 'error', message: 'Payment succeeded but verification failed. Please contact support.' });
            }
          } catch (e) {
            console.error('Verification failed:', e);
            setNotice({ type: 'error', message: 'Payment succeeded but verification failed. Please contact support.' });
          }
        },
        modal: {
          ondismiss: () => {
            setNotice({ type: 'info', message: 'Payment cancelled.' });
          }
        }
      });

      rzp.open();
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'Payment failed.';
      setNotice({ type: 'error', message: String(msg) });
    } finally {
      setPayingKey(null);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Products</h2>
      <p style={{ marginTop: 0, color: '#64748b' }}>
        This is a starter products page to validate payment gateway integration (Razorpay test mode).
      </p>

      {notice && (
        <div
          style={{
            margin: '0.75rem 0',
            padding: '0.75rem 0.9rem',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.08)',
            background:
              notice.type === 'success'
                ? '#ecfdf5'
                : notice.type === 'error'
                  ? '#fef2f2'
                  : '#eff6ff',
            color: '#0f172a'
          }}
        >
          {notice.message}
        </div>
      )}

      {products.length === 0 ? (
        <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>No products found</div>
          <div style={{ color: '#64748b' }}>Please check back later.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {products.map((p) => (
            <div key={p.key} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', background: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{p.title}</div>
              <div style={{ marginTop: '0.35rem', color: '#475569' }}>{p.description}</div>
              <div style={{ marginTop: '0.75rem', fontWeight: 800 }}>₹ {Number(p.amountInr).toFixed(0)}</div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: '0.75rem', width: '100%' }}
                disabled={payingKey === p.key}
                onClick={() => handlePay(p)}
              >
                {payingKey === p.key ? 'Opening...' : 'Pay'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


