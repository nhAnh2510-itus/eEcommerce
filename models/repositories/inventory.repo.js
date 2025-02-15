'use strict'

const inventory = require('../../models/inventory.model')


const createInventory = async ({productId, stock, location = 'unknow', shopId})=>{
    return await inventory.create({invent_productId:productId, invent_stock:stock, invent_location:location, invent_shopId:shopId})
}

module.exports = {
    createInventory
}