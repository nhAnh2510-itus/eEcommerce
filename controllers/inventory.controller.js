'use strict'

const InventoryService = require('../services/inventory.service')
const {OK,Created,SuccessResponse} = require('../core/success.response')

class InventoryController{
    createInventory = async (req, res, next)=>{
        req.body.shopId = req.user.userId
        new SuccessResponse({
            message:'Create inventory success!',
            metadata: await InventoryService.createInventory(req.body)
        }).Send(res)
    
    }
     addStockToInventory = async (req, res, next)=>{
        new SuccessResponse({
            message:'Add stock to Inventory success!',
            metadata: await InventoryService.addStockToInventory(req.body)
        }).Send(res)
     }
}

module.exports = new InventoryController()