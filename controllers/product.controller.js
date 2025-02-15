'use strict'

const ProductService = require("../services/product.service")
const {OK,Created,SuccessResponse} = require('../core/success.response')

//Thường phụ thuộc vào trạng thái của yêu cầu (request), nên sử dụng instance.
//Nếu bạn cần lưu trữ trạng thái của yêu cầu (request) giữa các phương thức, bạn cần sử dụng instance.
//Nếu bạn cần tạo một số instance-specific data, bạn cần sử dụng instance. 
//Dùng instance trong Controller để tận dụng khả năng mở rộng, lưu trạng thái, và quản lý các phương thức dễ dàng.

class ProductController {

   
    CreateProduct = async (req, res, next)=> {
        req.body.product_shop = req.user.userId;
        new SuccessResponse({
            message:'Create product success!',
            metadata: await ProductService.createProduct(req.body.product_type, req.body),
            
    }).Send(res)
    }
    UpdateProduct = async(req, res, next)=>{
        req.body.product_shop = req.user.userId;
        console.log('productId:',req.params.productId)
        new SuccessResponse({
            message:'Update product success!', 
            metadata: await ProductService.updateProduct(req.body.product_type, req.params.productId, req.body),
            
    }).Send(res)
    }

    publishProductByShop = async(req, res, next) =>{
        new SuccessResponse({
            message:'Create product success!',
            metadata: await ProductService.publishProductByShop(
                {product_id:req.params.id, 
                product_shop: req.user.userId}),
            
    }).Send(res)
    }
    // QUERY  //
    /**
     * @description Get all draft products for a shop
     * @param {Number} limit 
     * @param {Number} skip 
     * @return {JSON}  
     */

    GetAllDraftProducts = async(req, res, next) =>{
        new SuccessResponse({
            message:'Get all products success!',
            metadata: await ProductService.findAllDraftsForShop({product_shop: req.user.userId})
        }).Send(res)
    }


    GetAllPublishProducts = async(req, res, next) =>{
        new SuccessResponse({
            message:'Get all products success!',
            metadata: await ProductService.findAllPublishForShop({product_shop: req.user.userId})
        }).Send(res)
    }

    GetListSearchProduct = async(req, res, next) =>{
        new SuccessResponse({
            message:'Get all products success!',
            metadata: await ProductService.searchProduct(req.params)
        }).Send(res)
    }

    findAllProducts = async(req, res, next) =>{
        new SuccessResponse({
            message:'Get all products success!',
            metadata: await ProductService.findAllProduct(req.query)
        }).Send(res)
    }

    findProduct = async(req, res, next) =>{
        new SuccessResponse({
            message:'Get products success!',
            metadata: await ProductService.findProduct({
                product_id: req.params.productId
            })
        }).Send(res)
    }

}

module.exports = new ProductController();