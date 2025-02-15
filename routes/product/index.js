'use strict'

const express = require('express');
const router = express.Router();
const asyncHandler = require('../../helps/asyncHandler');
const {authenticationV2 } = require('../../auth/authUtils');
const productController = require('../../controllers/product.controller');

router.get('/all',asyncHandler(productController.findAllProducts))
router.get('/search/:keySearch',asyncHandler(productController.GetListSearchProduct))
router.get('/:productId',asyncHandler(productController.findProduct))
//Authentication//
router.use(authenticationV2)
// logout
router.post('',asyncHandler(productController.CreateProduct))
router.patch('/:productId',asyncHandler(productController.UpdateProduct))
router.post('/publish/:id',asyncHandler(productController.publishProductByShop))

// Query //
router.get('/draft/all',asyncHandler(productController.GetAllDraftProducts))
router.get('/published/all',asyncHandler(productController.GetAllPublishProducts))


module.exports = router;

