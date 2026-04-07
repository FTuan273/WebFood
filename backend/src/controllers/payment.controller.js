const { createPaymentRequest, verifyIpnSignature } = require('../services/momo.service');

/**
 * POST /api/payment/momo/create
 * Body: { amount: number, orderInfo?: string }
 */
exports.createMomoPayment = async (req, res) => {
  try {
    const { amount, orderInfo } = req.body;
    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Thiếu amount' });
    }
    const result = await createPaymentRequest({ amount, orderInfo });
    res.json({
      payUrl: result.payUrl,
      orderId: result.orderId,
      requestId: result.requestId,
      deeplink: result.deeplink,
      qrCodeUrl: result.qrCodeUrl,
    });
  } catch (err) {
    const code = err.statusCode || 500;
    console.error('[MoMo create]', err.message, err.momo || '');
    res.status(code).json({
      message: err.message,
      detail: err.momo,
    });
  }
};

/**
 * POST /api/payment/momo/ipn
 * MoMo gọi server-to-server — cần URL công khai (ngrok/production).
 */
exports.momoIpn = async (req, res) => {
  const secretKey = process.env.MOMO_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ message: 'Thiếu MOMO_SECRET_KEY' });
  }

  const body = req.body;
  const ok = verifyIpnSignature(body, secretKey);
  if (!ok) {
    console.warn('[MoMo IPN] Chữ ký không hợp lệ', body?.orderId);
    return res.status(400).json({ message: 'Invalid signature' });
  }

  if (String(body.resultCode) === '0') {
    console.log('[MoMo IPN] Thanh toán thành công', body.orderId, body.transId);
  }

  return res.json({ resultCode: 0, message: 'Success' });
};
