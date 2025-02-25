'use strict'

const inventory = require('../../models/inventory.model')
const { convertToObjectId } = require('../../utils')


const createInventory = async ({productId, stock, location = 'unknow', shopId})=>{
    return await inventory.create({invent_productId:productId, invent_stock:stock, invent_location:location, invent_shopId:shopId})
}

const reservationInventory = async ({productId, quantity, cardId}) =>{
    const query = {invent_productId: convertToObjectId(productId),
        invent_stock: {$gte: quantity}
    }, updateSet={
        $inc:{invent_stock: -quantity},
        $push:{invent_reservation: {
            quantity,
            cardId,
            createOn: new Date()
        }}
    }, options={upsert: true, new:true}
    return await inventory.findOneAndUpdate(query, updateSet, options)
}

module.exports = {
    createInventory,
    reservationInventory
}