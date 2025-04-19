'use strict'

const express = require('express');
const router = express.Router();
const asyncHandler = require('../../helps/asyncHandler');
const {authenticationV2 } = require('../../auth/authUtils');
const InventoryController = require('../../controllers/inventory.controller');


router.use(authenticationV2)
router.post('', asyncHandler(InventoryController.createInventory))
router.post('/addstock', asyncHandler(InventoryController.addStockToInventory))





module.exports = router;
