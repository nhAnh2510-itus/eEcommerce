'use strict'



const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'

const {Schema,model} = require('mongoose'); 

var keyTokenSchema = new Schema({
    user:{
        type:String,
        required:true,
        ref: 'Shop',
    },
    privateKey:{
        type:String,
        required:true,
    },
    publicKey:{
        type:String,
        required:true,
    },
    refreshTokenUsed:{
        type:Array,
        Default:[],
    },
    refreshToken:{
        type:String,
        required:true,
    },
},{
collection:COLLECTION_NAME,
Timestamp:true,
}
);


module.exports = model(DOCUMENT_NAME, keyTokenSchema);
