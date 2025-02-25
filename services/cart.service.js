'use strict'
const {cart} = require('../models/cart.model');

const {
    BadRequestError,
    NotFoundError,
} = require('../core/error.response');
const { getProductById } = require('../models/repositories/product.repo');
const { convertToObjectId } = require('../utils');
const { findProduct } = require('./product.service');

class CartService{

    static async createUserCart({userId,products}){
        const query = {cart_userId:userId, cart_state:'active'};
        const updateOrInsert = {
            $addToSet:{
                cart_products: products 
            }
        }
        const options = {upsert:true,new:true};
        return await cart.findOneAndUpdate(query,updateOrInsert,options);
    }

    static async updateQuantity({userId,productId,quantity}){
        
        const query = { 
            cart_userId: userId, // Chuyển sang số
            'cart_products.productId': productId,
            cart_state: 'active'
        };
        
        
        
        const updateSet = {
            $inc: { 'cart_products.$.quantity': quantity } // Cập nhật số lượng
        };

      
        
        const options = { new: true}; // Không dùng `upsert: true` để tránh lỗi
    
        return await cart.findOneAndUpdate(query, updateSet, options);
    }

    static async addToCart(payload){
        const {userId,product} = payload
        
        // check gio hang co ton tai khong
        // neu co thi update so luong
        // neu khong thi tao gio hang moi
        console.log('User ID:', userId);
        const findCart = await cart.findOne({cart_userId:userId});
        
        if(!findCart){
            
            return await CartService.createUserCart({userId:userId,products: product})
        }
        
        // co gio hang nhung chua co san pham
        if ( findCart.cart_products.length === 0) {
            
            findCart.cart_products = [product];
            return await findCart.save();
        }
        

        // neu gio hang ton tai va co san pham thi update quantity
        // return await CartService.updateQuantity({userId,products:product})

        const existingProduct = findCart.cart_products.find(p => 
            p.productId.toString() === product.productId.toString()
        );
        console.log('Existing Product:', existingProduct);

        if (existingProduct) {
            // Nếu sản phẩm đã có → Tăng số lượng
            console.log(product.quantity)
            console.log('111111')
            return await CartService.updateQuantity({ 
                userId, 
                productId: product.productId, 
                quantity:  product.quantity 
            });
        } else {
            console.log('222222')
            // Nếu sản phẩm chưa có, thêm vào giỏ hàng
            findCart.cart_products.push(product);
            return await findCart.save();
        }
    }
    // update cart
    /*
    userId,
     shop_order_ids:[
        {
            shopId,
            item_products:[
                {
                    product_id,
                    quantity,
                    product_price,
                    product_name,
                    old_quantity
                }
            ],
            version
            
        }
     ]

    */ 
     static async addToCartV2(payLoad) {
        // Kiểm tra dữ liệu đầu vào hợp lệ
        if (!payLoad?.shop_order_ids?.length || !payLoad.shop_order_ids[0]?.item_products?.length) {
            throw new BadRequestError("Invalid order format");
        }
        
        const { userId, shop_order_ids } = payLoad;
        const shopId = shop_order_ids?.[0]?.shopId;
        
        if (!shopId) throw new BadRequestError("Missing shopId");
    
        const { productId, quantity, old_quantity } = shop_order_ids[0].item_products[0];
    
        if (!productId) throw new BadRequestError("Invalid productId");
    
        console.log("Product ID:", productId, "Quantity:", quantity, "Old Quantity:", old_quantity);
    
        // Kiểm tra sản phẩm có tồn tại không
        const foundProduct = await getProductById(productId);
        if (!foundProduct) throw new NotFoundError("Product not found");
    
        // Kiểm tra shopId hợp lệ
        if (foundProduct.product_shop !== convertToObjectId(shopId)) {
            throw new NotFoundError("Product does not belong to the shop");
        }
    
        // Nếu số lượng là 0, xóa sản phẩm khỏi giỏ hàng
        if (quantity === 0) {
            return await CartService.deleteUserCart({ userId, productId });
        }
    
        // Kiểm tra số lượng hợp lệ
        const newQuantity = quantity - old_quantity;
        if (newQuantity < 0) throw new BadRequestError("New quantity cannot be negative");
    
        // Chuyển đổi productId sang ObjectId
        const objectId = convertToObjectId(productId);
    
        const updatedCart = await CartService.updateQuantity({
            userId,
            productId: objectId,
            quantity: newQuantity,
        });
    
        if (!updatedCart) throw new NotFoundError("Cart update failed");
    
        return updatedCart;
    }
    

   static async deleteUserCart({userId, productId}){
        const query = {cart_userId: userId, cart_state:'active'};
        const updateSet = {
            $pull:{
                cart_products:{
                    productId
                }
            }
        }
        const deleteCart = await cart.updateOne(query,updateSet);
        return deleteCart;
   }
   static async getListUserCart({userId}){
        return await cart.findOne({
            cart_userId: + userId,
        }).lean()
   }
}

module.exports = CartService;