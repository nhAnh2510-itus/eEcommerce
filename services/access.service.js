'use strict'
const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const keyTokenservice = require('./keyToken.service')
const {createTokenPair} = require('../auth/authUtils')
const {getInfoData} = require('../utils')
const { BadRequestError,AuthFailureError,ForbiddenError } = require('../core/error.response')
const {findByEmail} = require('./shop.service')
const {verifyJWT} = require('../auth/authUtils')

const RoleShop ={
    SHOP:'shop',
    WRITER:'writer',
    EDITOR:'admin',
}
// Không cần tạo một instance của AccessService để sử dụng phương thức này.
//Nếu bạn không sử dụng static, mỗi khi tạo một instance của class AccessService, một bản sao của phương thức signup sẽ được tạo lại và gắn vào instance đó. Điều này không cần thiết nếu tất cả các phương thức đều độc lập với instance.
class AccessService {

    static handlerRefreshToken = async (refreshToken)=>{ // Dùng khi accessToken hết hạn thì dùng refreshToken để tạo lại accessToken và khi mà refreshToken này đã được xài và dùng thêm lần nữa thì sẽ bị đưa vào nghi vấn
        // check xem token này đa được sử dụng chưa
        const foundToken = await keyTokenservice.findByRefreshTokenUsed(refreshToken)
        // Nếu có
        if(foundToken) {
            // decode xem đây là ai
            const{userId, email} = await verifyJWT(refreshToken,foundToken.privateKey)
            console.log({userId,email})
            // xóa tất cả token trong keyStore
            await keyTokenservice.deleteKeyById(userId)
            throw new ForbiddenError('somethings wrong happened!! Pls relogin')
            
        }

        const holderToken = await keyTokenservice.findByRefreshToken(refreshToken)
        if(!holderToken) throw new AuthFailureError('Shop not registered') 
        

        const {userId, email} = await verifyJWT(refreshToken,holderToken.privateKey)
        console.log('2--',{userId,email})
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new AuthFailureError('Shop not registered')

        // create 1 cap moi
        const tokens = await createTokenPair({userId,email},holderToken.publicKey,holderToken.privateKey)

        // await holderToken.Update({
        //     $set:{
        //         refreshToken: tokens.refreshToken
        //     },
        //     $addToSet:{
        //         refreshTokenUsed: refreshToken // da duoc dung de lay token moi
        //     }
        // })
        holderToken.refreshToken = tokens.refreshToken;
        holderToken.refreshTokenUsed.push(refreshToken);
        await holderToken.save();

        return {
            user:{userId, email},
            tokens
        }

    }


    static handlerRefreshTokenV2 = async ({refreshToken,user,keyStore})=>{ // Dùng khi accessToken hết hạn thì dùng refreshToken để tạo lại accessToken và khi mà refreshToken này đã được xài và dùng thêm lần nữa thì sẽ bị đưa vào nghi vấn
        const {userId, email} = user

        if(keyStore.refreshTokenUsed.includes(refreshToken)){
            await keyTokenservice.deleteKeyById(userId)
            throw new ForbiddenError('somethings wrong happened!! Pls relogin')
        }

        if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registered')
    
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new AuthFailureError('Shop not registered')

        // create 1 cap moi
        const tokens = await createTokenPair({userId,email},keyStore.publicKey,keyStore.privateKey)

        keyStore.refreshToken = tokens.refreshToken;
        keyStore.refreshTokenUsed.push(refreshToken);
        await keyStore.save();

        return {
            user,
            tokens
        }


    }

    static logout = async (keyStore)=>{
        const delkey = await keyTokenservice.removeById(keyStore._id)
        console.log('delkey',delkey)
        return delkey
    }


    static Login = async ({email,password, refreshToken = null})=>{ // lí do để refreshToken = null là vì khi tạo ban đầu sẽ chưa có, khi login lại cần xóa cookies thì lúc này cookies sẽ có refreshToken này và cần đưa vào refreshTokenUsed
        //1
        const foundShop = await findByEmail({email})
        if(!foundShop){
            throw new BadRequestError('Shop not found')
        }


        //2
        const match = bcrypt.compare(password,foundShop.password)
        if(!match) throw new AuthFailureError('Authentication error')
        
        //3
        const publicKey = crypto.randomBytes(64).toString('hex')
        const privateKey = crypto.randomBytes(64).toString('hex')

        //4 create token
        const {_id:userId} = foundShop._id
        const tokenPair = await createTokenPair({userId,email}, publicKey, privateKey)
        await keyTokenservice.createKeyToken({publicKey,privateKey,refreshToken:tokenPair.refreshToken,userId})
        return{
            metadata:{
                shop: getInfoData({fields:['name','email'],object:foundShop}),
                token: tokenPair
        }

    }}
    static signup = async({name,email,password})=>{
        try{
            //check email exist
            const holdermodel = await shopModel.findOne({email}).lean()
            if(holdermodel){
                throw new BadRequestError('Shop already exists')
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



