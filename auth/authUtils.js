'use strict'
const JWT = require('jsonwebtoken')

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

module.exports = {
    createTokenPair
}