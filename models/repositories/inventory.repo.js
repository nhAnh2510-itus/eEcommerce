'use strict'

const inventory = require('../../models/inventory.model')
const { convertToObjectId } = require('../../utils')
const { BadRequestError } = require('../../core/error.response')

const createInventory = async ({productId, stock, location = 'unknow', shopId})=>{
    return await inventory.create({invent_productId:productId, invent_stock:stock, invent_location:location, invent_shopId:shopId})
}

const reservationInventory = async ({productId, quantity, cardId}) =>{
    const inventory_found = await inventory.findOne({invent_productId: convertToObjectId(productId)})
    if(!inventory_found) throw new BadRequestError('Inventory not found')
    if(inventory_found.invent_stock < quantity) throw new BadRequestError('Not enough stock')
    const query = {invent_productId: convertToObjectId(productId),
        invent_stock: {$gte: quantity}
    }, updateSet={
        $inc:{invent_stock: -quantity},
        $push:{invent_reservation: {
            quantity,
            cardId,
            createOn: new Date()
        }}
    }, options={upsert: false, new:true}
    return await inventory.findOneAndUpdate(query, updateSet, options)
}

module.exports = {
    createInventory,
    reservationInventory
}