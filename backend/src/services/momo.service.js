/**
 * MoMo Payment Gateway — tạo giao dịch (captureWallet).
 * Tài liệu: https://developers.momo.vn
 */
const crypto = require('crypto');
const { randomUUID } = require('crypto');

function buildCreateSignature({
  accessKey,
  amount,
  extraData,
  ipnUrl,
  orderId,
  orderInfo,
  partnerCode,
  redirectUrl,
  requestId,
  requestType,
  secretKey,
}) {
  const raw =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  return crypto.createHmac('sha256', secretKey).update(raw).digest('hex');
}

/**
 * Xác thực chữ ký IPN (server-to-server callback).
 */
function verifyIpnSignature(body, secretKey) {
  const {
    accessKey = '',
    amount = '',
    extraData = '',
    message = '',
    orderId = '',
    orderInfo = '',
    orderType = '',
    partnerCode = '',
    payType = '',
    requestId = '',
    responseTime = '',
    resultCode = '',
    transId = '',
    signature,
  } = body || {};

  if (!signature) return false;

  const raw =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&message=${message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&orderType=${orderType}` +
    `&partnerCode=${partnerCode}` +
    `&payType=${payType}` +
    `&requestId=${requestId}` +
    `&responseTime=${responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${transId}`;

  const expected = crypto.createHmac('sha256', secretKey).update(raw).digest('hex');
  return signature === expected;
}

/**
 * @param {object} opts
 * @param {number} opts.amount - Số tiền (VND), số nguyên
 * @param {string} [opts.orderInfo] - Mô tả đơn hàng
 * @returns {Promise<{ payUrl: string, orderId: string, requestId: string, raw: object }>}
 */
async function createPaymentRequest({ amount, orderInfo }) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint =
    process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
  const redirectUrl = process.env.MOMO_REDIRECT_URL;
  const ipnUrl = process.env.MOMO_IPN_URL || redirectUrl;

  if (!partnerCode || !accessKey || !secretKey || !redirectUrl) {
    const err = new Error(
      'Thiếu cấu hình MoMo (MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_REDIRECT_URL)'
    );
    err.statusCode = 500;
    throw err;
  }

  const amountInt = Math.round(Number(amount));
  if (!Number.isFinite(amountInt) || amountInt < 1000) {
    const err = new Error('Số tiền tối thiểu 1.000đ (theo yêu cầu MoMo)');
    err.statusCode = 400;
    throw err;
  }

  const amountStr = String(amountInt);
  const orderId = `WF${Date.now()}${Math.random().toString(36).slice(2, 8)}`.slice(0, 50);
  const requestId = randomUUID();
  const extraData = '';
  const requestType = 'captureWallet';
  const safeOrderInfo = (orderInfo || 'Thanh toan don hang WebFood').slice(0, 255);

  const signature = buildCreateSignature({
    accessKey,
    amount: amountStr,
    extraData,
    ipnUrl,
    orderId,
    orderInfo: safeOrderInfo,
    partnerCode,
    redirectUrl,
    requestId,
    requestType,
    secretKey,
  });

  const payload = {
    partnerCode,
    partnerName: process.env.MOMO_PARTNER_NAME || 'WebFood',
    storeId: process.env.MOMO_STORE_ID || 'WebFoodStore',
    requestId,
    amount: amountStr,
    orderId,
    orderInfo: safeOrderInfo,
    redirectUrl,
    ipnUrl,
    lang: 'vi',
    extraData,
    requestType,
    signature,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (Number(data.resultCode) !== 0 || !data.payUrl) {
    const msg = data.message || data.localMessage || 'MoMo từ chối tạo giao dịch';
    const err = new Error(msg);
    err.statusCode = 502;
    err.momo = data;
    throw err;
  }

  return {
    payUrl: data.payUrl,
    orderId,
    requestId,
    deeplink: data.deeplink,
    qrCodeUrl: data.qrCodeUrl,
    raw: data,
  };
}

module.exports = {
  createPaymentRequest,
  verifyIpnSignature,
};
