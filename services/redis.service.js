'use strict'


const inventory = require('../models/inventory.model')
const {reservationInventory} = require('../models/repositories/inventory.repo')

const {promisify} = require('util');
// promisify dung de chuyen callback thanh promise
// vi du: redisClient.get('key', (err, data) => {console.log(data)})
// chuyen thanh

const redis = require('redis');
const config = require('../configs/config');

// Sử dụng URL kết nối Redis Cloud
const redisClient = redis.createClient(
    config.redis.port,  // Ví dụ: 6379
    config.redis.host,  // Ví dụ: 'redis-12345.c300.us-east-1-2.ec2.cloud.redislabs.com'
    {
      auth_pass: config.redis.password, // Redis Cloud password
      
    }
  );

// Xử lý sự kiện kết nối
redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('ready', () => console.log('Redis Client Connected'));



const pexpire = promisify(redisClient.pexpire).bind(redisClient); // dong nay dung de set expire cho key trong redis
const setnxAsync = promisify(redisClient.setnx).bind(redisClient); // dong nay dung de set key neu key chua ton tai
const delAsyncKey = promisify(redisClient.del).bind(redisClient);

const acquireLock = async (productId, quantity, cartId)=>{
    const key = `lock_v2023_${productId}`
    const retryTimes = 10;
    const expireTime = 3000; // 3 seconds tam block, để tránh hệ thống bị treo và ko phát khóa dẫn đến deadlock

    for(let i =0; i< retryTimes;i++){
        // tạo 1  key, thằng nào giữ key thì được vào thanh toán
        const result = await setnxAsync(key, expireTime)
        console.log('result:', result)
        if(result === 1){
            // thao tac voi inventory
            const isReservation = await reservationInventory({productId, quantity, cartId})
            if(isReservation){
                await pexpire(key, expireTime)
                return key;
            }
            return key;
        }else{
            await new Promise((resolve)=> setTimeout(resolve,50))
        }
    }
}

const releaseLock = async keyLock =>{
    
    return await delAsyncKey(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock
}