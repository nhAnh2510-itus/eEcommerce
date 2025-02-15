'use strict'

const { min } = require('lodash');
const {model,Schema,Types} = require('mongoose'); 
const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';
const slugify = require('slugify');

// Declare the Schema of the Mongo model
const productSchema = new Schema({
    product_name:{type:String,required:true,},
    product_thumb:{type:String,required:true,},
    product_description: String,
    product_slug:{type:String, require:true},
    product_price:{type:String,required:true,},
    product_quantity:{type:Number,required:true,},
    product_type:{type:String,required:true,enum:['Clothing','Electronics','Furniture']},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop',},
    product_attributes: {type: Schema.Types.Mixed, required: true},
    product_rating:{type:Number, default:4.5,
        min:[0,"Rating must be greater than 0"],
        max:[5,"Rating must be less than 5"],
        set: (value) => Math.round(value * 10) / 10
    },
    product_variations: {type: Array, default: []},
    isDraft: {type: Boolean, default: true, index: true, select: false},
    isPublished: {type: Boolean, default: false, index: true, select:false},

},{
    collection:COLLECTION_NAME,
    timestamps:true,
});

productSchema.pre('save',function(next){
    this.product_slug = slugify(this.product_name,{lower:true})
    next()
})

// define the producttype
const clothingSchema = new Schema({
    brand: {type: String},
    size: String,
    material: String,
    product_shop:{type: Schema.Types.ObjectId, ref: 'Shop',}
},{
    collection:'clothes',
    timestamps:true,
});

const electronicSchema = new Schema({
    manufacturer: {type: String, required: true},
    model: String,
    color: String,
    product_shop:{type: Schema.Types.ObjectId, ref: 'Shop',}
},{
    collection:'electronics',
    timestamps:true,
});


//Export the model
module.exports = {
product: model(DOCUMENT_NAME, productSchema),
clothing: model('clothing', clothingSchema),
electronics: model('electronics', electronicSchema),
}