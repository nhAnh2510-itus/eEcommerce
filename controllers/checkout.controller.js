'use strict'

const CheckoutService = require('../services/checkout.service');
const {OK,Created,SuccessResponse} = require('../core/success.response')

class CheckoutController{
    /**
     * @description checkout product
     * @param {int} req 
     * @param {*} res 
     * @param {*} next
     * @method POST 
     * @url /v1/api/checkout
     * @return {JSON} 
     */
    checkoutReviewProduct = async (req, res, next)=>{
        new SuccessResponse({
            message:'Review products success!',
            metadata: await CheckoutService.checkoutReview( req.body)
        }).Send(res)
    }
   
}

module.exports = new CheckoutController()