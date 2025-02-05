'use strict'

const keyTokenModel = require('../models/keyToken.model')

class keyTokenservice {
    static createKeyToken = async ({userId,publicKey,privateKey}) => {
        try {
            // const publickeyString = publicKey.toString()
            // const  token = await keyTokenModel.create({user:userId,publicKey:publickeyString})
            const token = await keyTokenModel.create({user:userId,publicKey,privateKey})
            return token ? token.publicKey : null
        } catch (err) {
            console.log('Error in createKeyToken:', err);
            return {
                code: '40001',
                message: err.message,
                status: 'error'
            }
        }
    }
}

module.exports = keyTokenservice