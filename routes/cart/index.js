'use strict'

const express = require('express');
const router = express.Router();
const asyncHandler = require('../../helps/asyncHandler');
const {authenticationV2 } = require('../../auth/authUtils');
const CartController = require('../../controllers/cart.controller');





router.post('',asyncHandler(CartController.addToCart))
router.delete('',asyncHandler(CartController.Delete))
router.post('/update',asyncHandler(CartController.updateCart))
router.get('',asyncHandler(CartController.listToCart))


module.exports = router;
