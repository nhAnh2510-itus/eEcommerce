'use strict'
const JWT = require('jsonwebtoken')
const asyncHandler = require('../helps/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER={
    API_KEY:'x-api-key',
    CLIENT_ID:'x-client-id',
    AUTHORIZATION:'authorization',
} // bắt buộc front end phải gửi 3 header này


const createTokenPair = async (payload,publicKey, privateKey)=>{
    try {
        const accessToken = JWT.sign(payload,publicKey,{
            // algorithm: 'RS256',
            expiresIn:'2 days'
        })

        const refreshToken = JWT.sign(payload,privateKey,{
            // algorithm: 'RS256',
            expiresIn:'7 days'
        })

        JWT.verify(accessToken, publicKey,(err,decoded)=>{
            if(err){
                console.error('Error verify',err)
            }else{
                console.log('decoded verify',decoded)
            }
        })
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        console.error('Error in createTokenPair:', error);
        throw error;
    }
}

const authentication = asyncHandler(async (req,res,next)=>{
    /**
     1- check user missing
     2- get accessToken
     3- verifyToken
     4- check user in bds
     5- check keystore with userId
     6- OK all=> return next()
     */
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('invalid user')


    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Not found keyStore')

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthFailureError('invalid token')

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId) throw new AuthFailureError('invalid user')
        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }
    // đây là 1 middleware, khi muốn request thì phải qua hàm này.
})

const verifyJWT = async (token, keySecret)=>{
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT
}