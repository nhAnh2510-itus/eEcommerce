'use strict'

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router();
const asyncHandler = require('../../helps/asyncHandler');
const {authentication, authenticationV2 } = require('../../auth/authUtils');
//signUp/IN
router.post('/shop/signup',asyncHandler(accessController.signup))
router.post('/shop/login',asyncHandler(accessController.login))
//Authentication//
router.use(authenticationV2)
// logout
router.post('/shop/logout',asyncHandler(accessController.logout))
router.post('/shop/handlerRefreshToken',asyncHandler(accessController.handlerRefreshToken))

module.exports = router;