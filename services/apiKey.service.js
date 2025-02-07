'use Strict'

const apiKeyModel = require("../models/apiKey.model")
const crypto = require('crypto')

const findById = async (key)=>{
    // const newKey = await apiKeyModel.create({key: crypto.randomBytes(64).toString('hex'),permissions:['0000']})
    // console.log(newKey)
    const objKey = await apiKeyModel.findOne({key}).lean() // Dung lean de tra ve object thuan tuy khong phai la mongoose document
    return objKey

}

module.exports = {findById}
