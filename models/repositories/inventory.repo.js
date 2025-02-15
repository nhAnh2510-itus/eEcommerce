'use strict'

const inventory = require('../../models/invention.model')


const createInventory = async (product_id, stock, location, shop_id)=>{
    return await inventory.create({invent_productId:product_id, invent_stock:stock, invent_location:location, invent_shopId:shop_id})
}

module.exports = {
    createInventory
}