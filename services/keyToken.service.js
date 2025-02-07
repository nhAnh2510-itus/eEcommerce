'use strict'

const keyTokenModel = require('../models/keyToken.model')
const mongoose = require('mongoose');
const {Types} = require('mongoose')

class keyTokenservice {
    static createKeyToken = async ({userId,publicKey,privateKey, refreshToken}) => {
        try {
            // const publickeyString = publicKey.toString()
            // const  token = await keyTokenModel.create({user:userId,publicKey:publickeyString})
            //level 0
            // const token = await keyTokenModel.create({user:userId,publicKey,privateKey})
            // return token ? token.publicKey : null
            //level 1
            const filter = {user:userId}, update = {publicKey,privateKey,refreshTokenUsed:[], refreshToken},options = {new:true,upsert:true}
            const tokens = await keyTokenModel.findOneAndUpdate(filter,update,options)
            return tokens? tokens.publicKey : null
        } catch (err) {
            console.log('Error in createKeyToken:', err);
            return {
                code: '40001',
                message: err.message,
                status: 'error'
            }
        }
    }

    static findByUserId = async(userId)=>{
        return await keyTokenModel.findOne({user: userId}).lean()
    }

    static removeById = async(id)=>{
        return await keyTokenModel.deleteOne(id)
    }

    static findByRefreshTokenUsed = async(refreshToken)=>{
        return await keyTokenModel.findOne({refreshTokenUsed:refreshToken}).lean()
    }

    static findByRefreshToken = async(refreshToken)=>{
        return await keyTokenModel.findOne({refreshToken})
    }

    static deleteKeyById = async(userId)=>{
        return await keyTokenModel.findOneAndDelete({user:userId})
    }
}

module.exports = keyTokenservice