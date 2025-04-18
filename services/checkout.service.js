'use strict'


const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const {getDiscountAmount} = require("../services/discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const {order} = require('../models/order.model')
const CartService = require("./cart.service");
const InventoryService = require("./inventory.service");

class CheckoutService{
    /* payload tu FE gui ve 
        {
            "cartTd":,
            "userId":,
            "shop_order_ids": [
                {
                    "shopId":,
                    "shop_discounts":[{
                        "shopId":,
                        "discountId":,
                        "codeId":
                        }],
                    "item_products":[{
                        "product_id":,
                        "quantity":,
                        "price":
                    },]
                }
            ]
        }
     */
    // lí do payload truyền cả sản phẩm là vì khi thanh toán khách hàng đôi lúc chỉ chọn 1 vài trong số sản phẩm họ thêm vào giỏ hàng cho nên sẽ truyển thêm săn phẩm để biết những sản phẩm nào họ muốn thanh toán
    static async checkoutReview({cartId, userId, shop_order_ids}){
        //check cartId ton tai khong
        const foundCart = await findCartById(cartId);
        if(!foundCart) throw new BadRequestError('Cart not found');

        const checkout_order ={
            totalPrice:0,
            feeShip:0,
            totalDiscount:0,
            totalCheckout:0
        }, shop_order_ids_new =[]
       
        for(let i=0;i<shop_order_ids.length;i++){
            console.log('Shop Order Ids:', shop_order_ids[i]);
            const {shopId, shop_discounts=[], item_products=[]} = shop_order_ids[i];
            const checkProductServer = await checkProductByServer(item_products)
            console.log('Check Product Server:', checkProductServer);
            if(!checkProductServer[0]){
                throw new BadRequestError('order wrong!')
            }

            // tổng tiền đơn hàng
            const checkoutPrice = checkProductServer.reduce((acc, product)=>{
                return acc + (product.quantity*product.price)
            },0)

            // tổng tiền trước khi xử lí
            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,
                priceApplyDiscount: checkoutPrice,
                item_product: checkProductServer,
                status: 'pending'
            }

            if(shop_discounts.length > 0  ){
                // giả sử chỉ có 1 discount
                // get discount amount
                const {totalPrice = 0, discount =0} = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                checkout_order.totalDiscount = discount

                if(discount > 0){
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }

            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            
            shop_order_ids_new.push(itemCheckout)
        }
        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
          }
    }


    //order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {},
    }){
        const {shop_order_ids_new, checkout_order} = await this.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })
        //check lai mot lan nua xem co vuot ton kho hay khong
        // get new array product
        const products = shop_order_ids_new.flatMap(order => order.item_product) // flatMap dung de chuyen array 2 chieu thanh 1 chieu
        console.log('[1]', products);
        let acquireProduct =[]
        for(let i=0; i<products.length;i++){
            const {productId, quantity} = products[i];
            const keyLock = await acquireLock(productId, quantity, cartId)  
            acquireProduct.push(keyLock? true : false)

           


            if(keyLock){
                await releaseLock(keyLock)
            }
        }

        if(acquireProduct.includes(false)){
            throw new BadRequestError('Some Product had update, please check again!')
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_product: shop_order_ids_new
        })

        // truong hop; neu insert thanh cong, thi remove product co trong cart
        if(newOrder){
            try {
                
                const deletePromises = products.map(product => 
                    CartService.deleteUserCart({userId, productId: product.productId})
                );
                await Promise.all(deletePromises);
                
                
                
                console.log(`Removed ${products.length} products from cart for user ${userId}`);
            } catch (error) {
                console.error('Error removing products from cart:', error);
                
            }
        }

        return newOrder
    }

    /*
        1> query Orders [Users]

    
    */

        static async GetOrderByUser(userId){

            const orders = await order.find({order_userId: userId})
            if(!orders) throw new BadRequestError('Orders not found')
            return orders

        }

     /*
        2> query Orders using ID [Users]
        
    
    */

        static async GetOneOrderById({orderId, userId}){
            const foundOrder = await order.findOne({_id: orderId})
            
            if(!foundOrder) throw new BadRequestError('Order not found')
            
            if(userId !== foundOrder.order_userId) throw new BadRequestError('Can not access this order')
            
            return foundOrder
          }


    /*
        3> Cancel Orders  [Users]
        
    
    */
        static async CancelOrderByUser({orderId, userId}) {
            try {
                // Lấy thông tin đơn hàng và chờ kết quả
                const order = await this.GetOneOrderById({orderId, userId});
                if(!order) throw new BadRequestError('Order not found');
                
                // Kiểm tra trạng thái đơn hàng
                if(order.order_status === 'cancel') throw new BadRequestError('Order has been cancelled');
                if(order.order_status === 'delivered') throw new BadRequestError('Order has been delivered');
                if(order.order_status === 'shipped') throw new BadRequestError('Order has been shipped');
                
                // Lấy danh sách sản phẩm từ đơn hàng
                const products = order.order_product.flatMap(item => item.item_product);
                
                // Cập nhật lại số lượng trong kho (hoàn trả sản phẩm)
                const inventoryUpdates = products.map(product => {
                    // Đảm bảo bạn có hàm cập nhật inventory thích hợp
                    return InventoryService.addStockToInventory({
                        productId: product.productId,
                        shopId: product.shopId, // Giả sử có shopId trong product
                        stock: product.quantity
                    });
                });
                
                // Chờ tất cả cập nhật inventory hoàn tất
                await Promise.all(inventoryUpdates);
                
                // Cập nhật trạng thái đơn hàng
                order.order_status = 'cancel';
                
                // Lưu thay đổi và trả về đơn hàng đã cập nhật
                return await order.save();
            } catch (error) {
                console.error('Error cancelling order:', error);
                throw error; // Hoặc xử lý lỗi theo cách phù hợp với ứng dụng của bạn
            }
        }
    /*
        4> Update Orders Status  [Shop/Admin]
        
    
    */
   /**
     * Cập nhật trạng thái đơn hàng bởi shop
     * @param {Object} param
     * @param {String} param.orderId - ID của đơn hàng
     * @param {String} param.shopId - ID của shop thực hiện cập nhật
     * @param {String} param.status - Trạng thái mới (confirmed, shipped, delivered)
     * @param {String} param.note - Ghi chú khi cập nhật trạng thái (tùy chọn)
     * @param {String} param.trackingNumber - Mã vận đơn (tùy chọn, chỉ cần khi status = shipped)
     */
    /*
        {
    
        "orderId",
        "shopId",
        "orderProducts":[
            {
                "productIds":[],
                "status":""
            }
        ],
    
    
    */
        static async UpdateOrderStatusByShop({
            orderId,
            shopId,
            orderProducts,
            note = '',
            trackingNumber = ''
        }) {
            // Kiểm tra trạng thái hợp lệ
            const validStatuses = ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'];
            
            // Tìm đơn hàng
            const foundOrder = await order.findOne({ _id: orderId });
            if (!foundOrder) throw new BadRequestError('Order not found');
        
            let isUpdated = false;
        
            // Duyệt qua danh sách sản phẩm cần cập nhật
            orderProducts.forEach(({ productIds, status }) => {
                if (!validStatuses.includes(status)) throw new BadRequestError(`Invalid status: ${status}`);
        
                foundOrder.order_product.forEach(orderItem => {
                    if (orderItem.shopId.toString() === shopId.toString()) {
                        orderItem.item_product.forEach(product => {
                            if (productIds.includes(product.productId.toString())) {
                                product.status = status;
                                isUpdated = true;
                            }
                        });
                    }
                });
            });
        
            if (!isUpdated) throw new BadRequestError('No products updated or unauthorized access.');
        
            // Nếu cập nhật trạng thái `shipped`, thêm tracking number
            if (trackingNumber && orderProducts.some(({ status }) => status === 'shipped')) {
                foundOrder.order_trackingNumber = trackingNumber;
            }
        
            // Lưu `note` nếu có
            if (note) {
                foundOrder.order_note = note;
            }

            const allStatus = foundOrder.order_product.flatMap(item => item.item_product).map(product => product.status);

            let newOrderStatus;
            if (allStatus.every(status => status === 'delivered')) {
                newOrderStatus = 'delivered';
            } else if (allStatus.every(status => status === 'cancelled')) {
                newOrderStatus = 'cancelled';
            } else if (allStatus.some(status => status === 'pending')) {
                newOrderStatus = 'pending';
            } else if (allStatus.some(status => status === 'confirmed')) {
                newOrderStatus = 'confirmed';
            } else {
                newOrderStatus = 'shipped';
            }

            foundOrder.order_status = newOrderStatus;

        
            // Lưu thay đổi vào database
            await foundOrder.save();
        
            return { message: 'Order status updated successfully' };
        }
        
        

}

module.exports = CheckoutService;