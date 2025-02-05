'use strict'
const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const keyTokenservice = require('./keyToken.service')
const {createTokenPair} = require('../auth/authUtils')
const {getInfoData} = require('../utils')


const RoleShop ={
    SHOP:'shop',
    WRITER:'writer',
    EDITOR:'admin',
}
// Không cần tạo một instance của AccessService để sử dụng phương thức này.
//Nếu bạn không sử dụng static, mỗi khi tạo một instance của class AccessService, một bản sao của phương thức signup sẽ được tạo lại và gắn vào instance đó. Điều này không cần thiết nếu tất cả các phương thức đều độc lập với instance.
class AccessService {
    static signup = async({name,email,password})=>{
        try{
            //check email exist
            const holdermodel = await shopModel.findOne({email}).lean()
            if(holdermodel){
                return {
                    code:'XXX',
                    message:'Shop already exist'
                }
            }
            const hashpassword = await bcrypt.hash(password,10)
            const newShop = await shopModel.create({name,email,password:hashpassword,roles:[RoleShop.SHOP]})
            if(newShop){
                // create private key, public key
                // publickey để verify token, hacker phải biết cả 2 mới hack đc
                // privatekey để tạo token
                // Khóa riêng (privateKey): Được sử dụng để ký mã token (ví dụ: JWT - JSON Web Token). Server dùng privateKey để tạo các token.
                // Khóa công khai (publicKey): Được gửi tới client hoặc dịch vụ khác để xác minh token. Client sử dụng publicKey để xác minh token.
                // const {privateKey,publicKey} = crypto.generateKeyPairSync('rsa',{modulusLength:4096,
                //     publicKeyEncoding:{type: 'pkcs1', format: 'pem'},
                //     privateKeyEncoding:{type: 'pkcs1', format: 'pem'}
                // })
                // console.log(privateKey, publicKey)
                // Phần trên chính là JWT với RSA là phần khóa nâng cao
                const publicKey = crypto.randomBytes(64).toString('hex')
                const privateKey = crypto.randomBytes(64).toString('hex')
                console.log(publicKey,privateKey)
                const keyStore = await keyTokenservice.createKeyToken({userId:newShop._id,publicKey,privateKey})
                // Đây là JWT 

                if(!keyStore){
                    return{
                        code:'xxxx',
                        message:'keyStore error'
                    }
                }

                // const publicKeyObject = crypto.createPublicKey(publicKeyString)

                //create token pair
                const tokenPair = await createTokenPair({userId: newShop._id,email}, publicKey, privateKey)
                if (!tokenPair) {
                    return {
                        code: 'XXXX',
                        message: 'Failed to create token pair'
                    };
                }

                return{
                    code:'201',
                    metadata:{
                        shop: getInfoData({fields:['name','email'],object:newShop}),
                        token : tokenPair
                    }
                }
            }
            
            return{
                code:'200',
                metadata:null
            }

        }catch(err){
            console.error(err)
           return{
                code:'40001',
                message:err.message,
                status:'error'
           }
        }
    }
    

}

module.exports = AccessService