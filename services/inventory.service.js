'use strict'

const inventory  = require('../models/inventory.model')
const {
    getProductById

} = require('../models/repositories/product.repo')
const {createInventory} = require('../models/repositories/inventory.repo')
const {convertToObjectId} = require('../utils')
const { BadRequestError,AuthFailureError,ForbiddenError } = require('../core/error.response')

class InventoryService{
    static async createInventory({shopId,productId,stock,location}){
        const product = getProductById(productId)
        console.log('product', product)
        if(!product) throw new BadRequestError('Product does not exists')
        const inventory = await createInventory({productId,stock,location,shopId})
        if(!inventory) throw new BadRequestError('Create inventory failed')
        return inventory
        
    }
    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location = '134, Tran Phu, HCM city'
    }){
        const query ={invent_shopId: shopId, invent_productId: productId}
        const updateSet = {
            $inc:{invent_stock: stock},
            $set:{invent_location: location}
        }, options = {upsert: true, new:true}

        return await inventory.findOneAndUpdate(query, updateSet, options)
    }
    
}

module.exports = InventoryService