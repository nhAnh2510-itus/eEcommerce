'use strict'

const {Schema,model} = require('mongoose');

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'



// Declare the Schema of the Mongo model
var cartSchema = new Schema({
    cart_state:{
        type:String,
        required:true,
        enum:['active','completed','failed','pending'],
        default:'active',
    },
    userId:{
        type:String,
        required:true,
    },
    cart_products:{
        type:Array,
        default:[],
        required:true,
        /*[{
            product_id:,
            product_quantity:,
            product_shopId,
            product_price:,
            product_name
    }]*/
    },
    cart_count_product:{
        type:Number,
        default:0,
    },
    cart_userId:{
        type:Number,
        required:true,
    }
},{
    collection:COLLECTION_NAME,
    timestamps:{
        createdAt:'createdOn',
        updatedAt:'modifiedOn'
    },
});

//Export the model
module.exports = {cart: model(DOCUMENT_NAME, cartSchema)}