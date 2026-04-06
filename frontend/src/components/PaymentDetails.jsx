import React, { useState } from 'react';
import { Building2, Smartphone, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Thông tin thanh toán: chuyển khoản ngân hàng + tùy chọn MoMo (checkbox khi chọn CK NH).
 * Cấu hình qua biến VITE_* trong .env (frontend).
 */
const PaymentDetails = ({ variant, grandTotal, useMomo, onMomoToggle }) => {
  const [copiedField, setCopiedField] = useState(null);

  const bankName = import.meta.env.VITE_BANK_NAME || '';
  const bankAccount = import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '';
  const bankOwner = import.meta.env.VITE_BANK_ACCOUNT_NAME || '';
  const bankBranch = import.meta.env.VITE_BANK_BRANCH || '';
  const bankQr = import.meta.env.VITE_BANK_QR_URL || '';

  const momoPhone = import.meta.env.VITE_MOMO_PHONE || '';
  const momoName = import.meta.env.VITE_MOMO_NAME || '';
  const momoQr = import.meta.env.VITE_MOMO_QR_URL || '';

  const transferContent = `WEBFOOD ${grandTotal.toFixed(0)}`;

  const copyText = async (text, fieldKey) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      toast.success('Đã sao chép');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };

  const CopyBtn = ({ text, fieldKey }) =>
    text ? (
      <button
        type="button"
        className="payment-copy-btn"
        onClick={() => copyText(text, fieldKey)}
        aria-label="Sao chép"
      >
        {copiedField === fieldKey ? <Check size={16} /> : <Copy size={16} />}
      </button>
    ) : null;

  const showBank = variant === 'bank';
  const showMomoOnly = variant === 'momo';
  const showMomoBlock = showMomoOnly || (showBank && useMomo);

  if (!showBank && !showMomoOnly) return null;

  return (
    <div className="payment-details-wrap">
      {showBank && (
        <div className="payment-details-card">
          <div className="payment-details-head">
            <Building2 size={20} className="payment-details-icon" />
            <span>Chuyển khoản ngân hàng</span>
          </div>
          <p className="payment-details-hint">
            Vui lòng chuyển khoản đúng số tiền và nội dung để đơn được xử lý nhanh.
          </p>

          {!bankAccount && !bankName ? (
            <p className="payment-details-placeholder">
              Cấu hình <code>VITE_BANK_*</code> trong file <code>.env</code> của frontend.
            </p>
          ) : (
            <dl className="payment-details-list">
              {bankName ? (
                <div className="payment-details-row">
                  <dt>Ngân hàng</dt>
                  <dd>{bankName}{bankBranch ? ` — ${bankBranch}` : ''}</dd>
                </div>
              ) : null}
              {bankAccount ? (
                <div className="payment-details-row payment-details-row--copy">
                  <dt>Số tài khoản</dt>
                  <dd>
                    <strong>{bankAccount}</strong>
                    <CopyBtn text={bankAccount} fieldKey="bankAcc" />
                  </dd>
                </div>
              ) : null}
              {bankOwner ? (
                <div className="payment-details-row">
                  <dt>Chủ tài khoản</dt>
                  <dd>{bankOwner}</dd>
                </div>
              ) : null}
              <div className="payment-details-row payment-details-row--copy">
                <dt>Nội dung CK</dt>
                <dd>
                  <code className="payment-transfer-code">{transferContent}</code>
                  <CopyBtn text={transferContent} fieldKey="content" />
                </dd>
              </div>
            </dl>
          )}

          {bankQr ? (
            <div className="payment-qr">
              <img src={bankQr} alt="QR chuyển khoản ngân hàng" />
            </div>
          ) : null}

          <label className="payment-momo-checkbox">
            <input
              type="checkbox"
              checked={!!useMomo}
              onChange={(e) => onMomoToggle?.(e.target.checked)}
            />
            <span>Thanh toán qua ví MoMo</span>
          </label>
        </div>
      )}

      {showMomoBlock && (
        <div className="payment-details-card payment-details-card--momo">
          <div className="payment-details-head">
            <Smartphone size={20} className="payment-details-icon payment-details-icon--momo" />
            <span>{showMomoOnly ? 'Thanh toán MoMo' : 'Hướng dẫn MoMo'}</span>
          </div>
          {!momoPhone && !momoName ? (
            <p className="payment-details-placeholder">
              Cấu hình <code>VITE_MOMO_PHONE</code>, <code>VITE_MOMO_NAME</code> trong <code>.env</code>.
            </p>
          ) : (
            <dl className="payment-details-list">
              {momoName ? (
                <div className="payment-details-row">
                  <dt>Tên hiển thị</dt>
                  <dd>{momoName}</dd>
                </div>
              ) : null}
              {momoPhone ? (
                <div className="payment-details-row payment-details-row--copy">
                  <dt>Số MoMo</dt>
                  <dd>
                    <strong>{momoPhone}</strong>
                    <CopyBtn text={momoPhone} fieldKey="momo" />
                  </dd>
                </div>
              ) : null}
              <div className="payment-details-row payment-details-row--copy">
                <dt>Nội dung</dt>
                <dd>
                  <code className="payment-transfer-code">{transferContent}</code>
                  <CopyBtn text={transferContent} fieldKey="momoContent" />
                </dd>
              </div>
            </dl>
          )}
          {momoQr ? (
            <div className="payment-qr">
              <img src={momoQr} alt="QR MoMo" />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
