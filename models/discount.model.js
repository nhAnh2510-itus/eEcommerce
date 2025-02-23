'use strict'

const { Schema, model } = require('mongoose')
const {Types} = require('mongoose')
const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'


// Declare the Schema of the Mongo model
var discountSchema = new Schema({
    discount_name:{
        type:String,
        required:true,
    },
    discount_code:{
        type:String,
        required:true,
    },
    discount_description:{
        type:String,
        required:true,
    },
    discount_type:{
        type:String,
        default:'percentage',
        enum:['percentage','fixed'],
    },
    discount_value:{
        type:Number,
        required:true,
    },
    discount_start_date:{
        type:Date,
        required:true,
    },
    discount_end_date:{
        type:Date,
        required:true,
    },
    discount_max_usage:{
        type:Number,
        required:true,
        default:1,
    },
    discount_max_usage_per_user:{
        type:Number,
        required:true,
        default:1,
    },
    discount_count_used:{
        type:Number,
        required:true
    },
    discount_user_used:{
        type:Array,
        default:[],
    },
    discount_min_order_value:{
        type: Number,
        required:true,
    },
    discount_shopId:{
        type:Schema.Types.ObjectId,
        ref: "Shop",
    },
    discount_isActive:{
        type:Boolean,
        default:true,
    },
    discount_applies_to:{
        type: String,
        required:true,
        enum:['all','specific_products'],
    },
    discount_products_ids:{ // nhung san pham duoc ap dung
        type: Array,
        default: [],}
},{
    collection:COLLECTION_NAME,
    timestamps:true,
});
// co the them danh mục sản phẩm giảm giá
// Áp dụng cho những khu vực 
//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);