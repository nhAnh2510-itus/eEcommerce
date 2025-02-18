'use strict'


const {
    BadRequestError,
    NotFoundError,
} = require('../core/error.response')

const discount = require('../models/discount.model')
const { product } = require('../models/product.model')
const { findAllProduct } = require('../models/repositories/product.repo')
const { convertToObjectId } = require('../utils')
const { findAllDiscountCodesUnselect,findAllDiscountCodesSelect, checkDiscountExists } = require('../models/repositories/discount.repo')
class DiscountService{
    static async createDiscount (payload){
        const {
            code, start_date, end_date, value, type, max_uses, uses_count, max_uses_per_user, max_value, min_order_value, shop_id,
            is_active, description, product_ids, applies_to, name 
        } = payload
        if(new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            throw new BadRequestError('Invalid date range')
        }



        // create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectId(shop_id)
        }).lean()

        if(foundDiscount && foundDiscount.discount_isActive) throw new BadRequestError('Discount code already exists')

        const newDiscount = await discount.create({
            discount_name: name,
            discount_code: code,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_usage: max_uses,
            discount_count_used: uses_count,
            discount_max_usage_per_user: max_uses_per_user,
            discount_max_value: max_value,
            discount_min_order_value: min_order_value || 0,
            discount_shopId: convertToObjectId(shop_id),
            discount_isActive: is_active,
            discount_applies_to: applies_to,
            discount_products: applies_to ==='all'? []:product_ids
        })

        return newDiscount
    }

    static async updateDiscount (discount_id, payload){

    }

    static async getAllDiscountCodesWithProducts({code, shop_id, userId, limit, page}){
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectId(shop_id)
        }).lean()

        if(!foundDiscount || !foundDiscount.discount_isActive) throw new NotFoundError('Discount code not found')

        let products
        const {discount_applies_to, discount_product_ids} = foundDiscount
        if(discount_applies_to === 'all') {
            products = await findAllProduct({
                filter: {
                    product_shop: convertToObjectId(shop_id),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if(discount_applies_to === 'specific') {
            products = await findAllProduct({
                filter: {
                    _id:{$in: discount_product_ids},
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
    }

    static async getAllDiscountCodesByShop({limit, page,
        shop_id
    }){
         const discounts = await findAllDiscountCodesUnselect({limit: +limit,
            page: +page,
            filter:{
                discount_shopId: convertToObjectId(shop_id),
                discount_isActive: true
            },
            unSelect:['__v','discount_shopId'],
            model: discount
         })

         return discounts
    }

    static async getDiscountAmount({codeId, userId, shopId, products}){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter:{discount_code:codeId,
                discount_shopId:convertToObjectId(shopId)
            } 
        })

        if(!foundDiscount) throw new NotFoundError('Discount does not  exists')
        
        const {discount_isActive,
            discount_max_usage,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_max_usage_per_user,
            discount_value,
            discount_type,
            discount_user_usage
        } = foundDiscount


        if(!discount_isActive) throw new NotFoundError('discount expried!')
        if(!discount_max_usage) throw new NotFoundError('Discount are out')
        if( new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) throw new NotFoundError('Discount is not valid')
        let totalAmount = 0
        if(discount_min_order_value > 0 ) {
            totalAmount = products.reduce((acc, product)=>{
                return acc + product.product_price*product.product_quantity 
            },0)

            if(totalAmount < discount_min_order_value) throw new NotFoundError(`Discount requires minimum order value ${discount_min_order_value}`)
        }

        if(discount_max_usage_per_user > 0){
            const userUseDiscount = discount_user_usage.find(user => user.userId === userId)
            if(userUseDiscount > discount_max_usage_per_user) throw new NotFoundError('Discount used up')
        }
        
        const amount = discount_type === 'fixed' ? discount_value: totalAmount*(discount_value/100) 

        return {
            totalAmount,
            discountAmount: amount,
            totalPrice: totalAmount - amount
        }
    }

    static async deleteDiscountCode({codeId, shopId}){
        const deleted = discount.findOneAndDelete({discount_code: codeId, discount_shopId: convertToObjectId(shopId)}) 
        return deleted
    }

    static async cancelDiscountCode ({codeId, shopId, userId}){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter:{discount_code:codeId,
                discount_shopId:convertToObjectId(shopId)
            } 

        })
        if(!foundDiscount) throw new NotFoundError('Discount does not  exists')

        const result = await discount.findByIdAndUpdate(foundDiscount._id,{
            $pull:{
                discount_users_usage: userId
            },
            $inc:{
                discount_max_usage: 1,
                discount_count_used: -1
            }
        })

        return result
    }
}

module.exports = DiscountService