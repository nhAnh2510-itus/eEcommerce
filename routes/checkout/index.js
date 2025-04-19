'use strict'

const express = require('express');
const router = express.Router();
const asyncHandler = require('../../helps/asyncHandler');
const {authenticationV2 } = require('../../auth/authUtils');
const CheckoutController = require('../../controllers/checkout.controller');



router.use(authenticationV2)
router.post('/order', asyncHandler(CheckoutController.orderByUser))
router.post('/review',asyncHandler(CheckoutController.checkoutReviewProduct))


module.exports = router;
