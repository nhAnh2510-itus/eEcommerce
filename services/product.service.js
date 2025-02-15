'use strict'

const {product,clothing,electronics} = require('../models/product.model')
const inventory = require('../models/inventory.model')
const { BadRequestError,AuthFailureError,ForbiddenError } = require('../core/error.response')
const {createInventory} = require('../models/repositories/inventory.repo')
const {findAllDraftsForShop,
     publishProductByShop,
     findAllPublishForShop,
     searchProductByUser,
        findAllProduct,
        findProduct,
        updateProductById
    } = require('../models/repositories/product.repo')
const {removeUndefinedObject, updateNestedObjectParse} = require('../utils/index')
const { query } = require('express')

class ProductFactory{
    static productRegistry = {} // key value

    static registerProduct(type, classref){
        return ProductFactory.productRegistry[type] = classref
    }
    static async createProduct(type,payload){
        
        // switch(type){
        //     case 'Clothing':
        //         return new Clothing(payload).createProduct()
        //     case 'Electronics':
        //         return new Electronic(payload).createProduct()
        //     default:
        //         throw new BadRequestError(`Invalid product type, ${type}`)

        // } // ver 1
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError(`Invalid product type, ${type}`)

        return new productClass(payload).createProduct()
    }

    static async updateProduct(type, productId,payload){
        
        
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError(`Invalid product type, ${type}`)

        return new productClass(payload).updateProduct(productId)
    }


    //PUT//
    static async publishProductByShop({product_shop,product_id}){
        return await publishProductByShop({product_shop,product_id})
    }
    //END PUT//

    //QUERY//

    static async findAllDraftsForShop({product_shop, limit = 50,skip = 0}){
        const query = {product_shop,isDraft:true}
        return await findAllDraftsForShop({query,skip,limit})

    }

    static async findAllPublishForShop({product_shop, limit = 50,skip = 0}){
        const query = {product_shop,isPublished:true}
        return await findAllPublishForShop({query,skip,limit})

    }

    static async searchProduct({keySearch}){
        return await searchProductByUser({keySearch})
    }

    static async findAllProduct({ limit = 50, sort = 'ctime', page = 1, filter = {isPublished: true}}){
        return await findAllProduct({ limit, sort, page, filter, select:['product_name','product_price','product_thumb']})
    }

    static async findProduct({product_id}){
        
        return await findProduct({product_id, unselect:['__v']})
    }
    //END QUERY//
}



class Product{
    

    constructor(payload) {
        this.product_name = payload.product_name;
        this.product_thumb = payload.product_thumb;
        this.product_description = payload.product_description;
        this.product_price = payload.product_price;
        this.product_quantity = payload.product_quantity;
        this.product_type = payload.product_type;
        this.product_shop = payload.product_shop;
        this.product_attributes = payload.product_attributes;
    }
    async createProduct(product_id){
        const newProduct =  await product.create({...this, _id : product_id})
        if(newProduct) {
            await createInventory({productId: newProduct._id, stock: this.product_quantity, shopId: this.product_shop})
        }

        return newProduct
    }

    // update product
    async updateProduct(productId, bodyUpdate){
        return await updateProductById({productId, bodyUpdate, model:product})

    }


}

class Clothing extends Product{

    async createProduct(){
        const clothes =  await clothing.create({...this.product_attributes, product_shop: this.product_shop})
        if(!clothes) throw new BadRequestError('Clothing not created')
        
        const newProduct = super.createProduct(clothes._id)
        if(!newProduct) throw new BadRequestError('Product not created')

        return newProduct;
    }

    async updateProduct(productId){
        // Xác nhận có phải shop hay không
        /**
            {
                a:undefined,
                b: null
            }
        */
        //1 remove attr has null undefined
        console.log('[1]:',this)
        const objectParams = removeUndefinedObject(this) 
        console.log('[2]:',objectParams)
        //2 check update ở đâu
        if(objectParams.product_attributes){
            // update child
            await updateProductById({ productId, bodyUpdate: updateNestedObjectParse(objectParams), model: clothing });

        }
        const updateProduct = await super.updateProduct(productId, objectParams)
        return updateProduct

        //// Note: ở đây có thể dùng transaction do 2 bảng liên quan nhau nếu 1 bảng update thất bại thì 2 bảng đều phải rollback, để dùng transaction trong mongodb thì dùng 2 phase commit
        //// transaction chỉ hoạt động trên Replica Set
    }

    
}

class Electronic extends Product{
    async createProduct(){
        const Newelectronics =  await electronics.create({...this.product_attributes, product_shop: this.product_shop})
        if(!electronics) throw new BadRequestError('Clothing not created')
        
        const newProduct = super.createProduct(Newelectronics._id)
        if(!newProduct) throw new BadRequestError('Product not created')
        
        return newProduct;
    }
}

ProductFactory.registerProduct('Clothing',Clothing)
ProductFactory.registerProduct('Electronics',Electronic)



module.exports = ProductFactory

