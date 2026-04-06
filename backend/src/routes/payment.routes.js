const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/momo/create', paymentController.createMomoPayment);
router.post('/momo/ipn', paymentController.momoIpn);

module.exports = router;
