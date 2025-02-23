'use strict'


const {product, clothing, electronics} = require('../../models/product.model');
const{ Types} = require('mongoose');
const {getSelectData,unGetSelectData, convertToObjectId} = require('../../utils/')

const findAllDraftsForShop = async ({query, skip,limit})=>{
    return await product.find(query).
    populate('product_shop','name email -_id').
    sort({updatedAt:-1}).
    skip(skip).
    limit(limit).
    lean();
}

const findAllPublishForShop = async ({query, skip,limit})=>{
    return await product.find(query).
    populate('product_shop','name email -_id').
    sort({updatedAt:-1}).
    skip(skip).
    limit(limit).
    lean();
}

const findAllProduct = async ({ limit, sort, page, filter, select})=>{
    const skip = (page - 1)*limit;
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
    const Products = await product.find(filter).
    sort(sortBy).
    skip(skip).
    limit(limit).
    select(getSelectData(select)).
    lean();

    return Products
}

const findProduct = async ({ product_id,unselect})=>{

    const Products = await product.findById(product_id).
    select(unGetSelectData(unselect))
    return Products
}


const searchProductByUser = async ({keySearch}) =>{
    // trước khi chạy thì phải tạo index db.Products.createIndex({ product_name: "text", product_description: "text" })
    const regexSearch = new RegExp(keySearch)
    const result = await product.find({
        isDraft:false,
        $text:{$search: regexSearch}},
        {score:{$meta: 'textScore'}}
    ).sort({score:{$meta:'textScore'}}).lean()

    return result
}

const publishProductByShop = async ({product_shop, product_id})=>{
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })

    if(!foundShop) return null

    foundShop.isDraft = false
    foundShop.isPublished = true
    const {modifyCount} = await foundShop.save()

    return modifyCount

}

const updateProductById = async ({productId, bodyUpdate, model, isNew = true})=>{
    return await model.findByIdAndUpdate(productId,bodyUpdate,{new:isNew})
}

const getProductById = async (productId)=>{
    return await product.findOne({_id:convertToObjectId(productId )}).lean()
}
module.exports = {findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    searchProductByUser,
    findAllProduct,
    findProduct,
    updateProductById,
    getProductById
}