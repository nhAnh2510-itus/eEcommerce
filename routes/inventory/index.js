'use strict'

const express = require('express');
const router = express.Router();
const asyncHandler = require('../../helps/asyncHandler');
const {authenticationV2 } = require('../../auth/authUtils');
const InventoryController = require('../../controllers/inventory.controller');


router.use(authenticationV2)
router.post('/review', asyncHandler(InventoryController.addStockToInventory))





module.exports = router;
