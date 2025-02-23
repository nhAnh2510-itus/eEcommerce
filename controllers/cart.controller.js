'use strict'

const CartService = require('../services/cart.service');
const {OK,Created,SuccessResponse} = require('../core/success.response')

class CartController{
    /**
     * @description Add product to cart
     * @param {int} req 
     * @param {*} res 
     * @param {*} next
     * @method POST 
     * @url /v1/api/cart/user
     * @return {JSON} 
     */
    addToCart = async (req, res, next)=>{
        new SuccessResponse({
            message:'Add product to cart success!',
            metadata: await CartService.addToCart(
                req.body
            )
        }).Send(res)
    }
    /**
     * @description Update product quantity in cart
     * @param {int} req 
     * @param {*} res 
     * @param {*} next
     * @method PUT 
     * @url /v1/api/cart/user
     * @return {JSON} 
     */
    updateCart = async (req, res, next)=>{
        new SuccessResponse({
            message:'Update cart success!',
            metadata: await CartService.addToCartV2(
                req.body
            )
        }).Send(res)
    }
    
    Delete = async (req, res, next)=>{
        new SuccessResponse({
            message:'Update cart success!',
            metadata: await CartService.deleteUserCart(
                req.body
            )
        }).Send(res)
    }

    listToCart = async (req, res, next)=>{
        new SuccessResponse({
            message:'List cart!',
            metadata: await CartService.getListUserCart(
                req.query
            )
        }).Send(res)
    }
    
}

module.exports = new CartController()