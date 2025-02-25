'use strict'

const InventoryService = require('../services/inventory.service')
const {OK,Created,SuccessResponse} = require('../core/success.response')

class InventoryController{
     addStockToInventory = async (req, res, next)=>{
        new SuccessResponse({
            message:'Add stock to Inventory success!',
            metadata: await InventoryService.addStockToInventory(req.body)
        }).Send(res)
     }
}

module.exports = new InventoryController()