'use strict'


const DiscountService = require('../services/discount.service')
const {OK,Created,SuccessResponse} = require('../core/success.response')


class DiscountController{
    createDiscountCode = async (req, res, next)=>{
       
        new SuccessResponse({
            message: 'Discount code created successfully',
            metadata: await DiscountService.createDiscount(
               {...req.body, 
                shop_id: req.user.userId} 
               ),
        }).Send(res)
    }
    getAllDiscountCodes = async (req, res , next)=>{
        new SuccessResponse({
            message: 'Discount codes fetched successfully',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shop_id: req.user.userId
            })
        }).Send(res)
    }

    getDiscountAmount = async (req, res , next)=>{
        new SuccessResponse({
            message: 'Discount amount',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).Send(res)
    }

    getDiscountCodesWithProducts = async (req, res , next)=>{
        
        new SuccessResponse({
            
            message: 'Discount codes with products fetched successfully',
            metadata: await DiscountService.getAllDiscountCodesWithProducts(
                {...req.query, shop_id: "67a39dd2e7e002d5dcab69dd"}
            )
        }).Send(res)
    }
}

module.exports = new DiscountController()