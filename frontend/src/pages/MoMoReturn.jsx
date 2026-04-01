import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * Trang redirect sau khi thanh toán MoMo (query: resultCode, message, orderId, ...).
 */
const MoMoReturn = () => {
  const [params] = useSearchParams();
  const { clearCart } = useCart();

  const resultCode = params.get('resultCode');
  const message = params.get('message');
  const orderId = params.get('orderId');

  const success = resultCode === '0';

  useEffect(() => {
    if (resultCode == null) return;
    const dedupeKey = `momo_return_${orderId || 'na'}_${resultCode}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, '1');

    if (success) {
      toast.success('Thanh toán MoMo thành công!');
      clearCart();
    } else {
      toast.error(message || 'Thanh toán chưa hoàn tất');
    }
  }, [resultCode, message, orderId, success, clearCart]);

  return (
    <div className="container section" style={{ minHeight: '55vh', padding: '48px 16px' }}>
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          textAlign: 'center',
          padding: '32px 24px',
          background: 'var(--bg-card, #fff)',
          borderRadius: 12,
          border: '1px solid var(--border)',
        }}
      >
        {resultCode == null ? (
          <>
            <p style={{ color: 'var(--text-muted)' }}>Không có thông tin giao dịch MoMo.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-block' }}>
              Về trang chủ
            </Link>
          </>
        ) : success ? (
          <>
            <CheckCircle size={56} color="var(--primary)" style={{ marginBottom: 16 }} />
            <h1 style={{ fontSize: '1.35rem', marginBottom: 8 }}>Thanh toán thành công</h1>
            {orderId ? (
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Mã giao dịch: {orderId}</p>
            ) : null}
            <Link to="/" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-block' }}>
              Về trang chủ
            </Link>
          </>
        ) : (
          <>
            <XCircle size={56} color="#c0392b" style={{ marginBottom: 16 }} />
            <h1 style={{ fontSize: '1.35rem', marginBottom: 8 }}>Thanh toán chưa thành công</h1>
            {message ? (
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                {(() => {
                  try {
                    return decodeURIComponent(message);
                  } catch {
                    return message;
                  }
                })()}
              </p>
            ) : null}
            <Link to="/checkout" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-block' }}>
              Thử lại thanh toán
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MoMoReturn;
