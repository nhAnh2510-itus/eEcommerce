'use strict'

const express = require('express');
const router = express.Router();
const asyncHandler = require('../../helps/asyncHandler');
const {authenticationV2 } = require('../../auth/authUtils');
const CheckoutController = require('../../controllers/checkout.controller');





router.post('/review',asyncHandler(CheckoutController.checkoutReviewProduct))

module.exports = router;
