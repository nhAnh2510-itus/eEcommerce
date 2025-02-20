'use strict'

const express = require('express');
const router = express.Router();
const asyncHandler = require('../../helps/asyncHandler');
const {authenticationV2 } = require('../../auth/authUtils');
const DiscountController = require('../../controllers/discount.controller');

router.post('/amount', asyncHandler(DiscountController.getDiscountAmount))
router.get('/list_product_code', asyncHandler(DiscountController.getDiscountCodesWithProducts))

router.use(authenticationV2)

router.post('', asyncHandler(DiscountController.createDiscountCode))
router.get('', asyncHandler(DiscountController.getAllDiscountCodes))



module.exports = router;
