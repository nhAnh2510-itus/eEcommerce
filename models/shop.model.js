'use Strict'

const {Schema, model} = require('mongoose'); // Erase if already required
const DOCUMENT_NAME = 'Shop';
const COLLECTION_NAME = 'Shops';

// Declare the Schema of the Mongo model
var shopSchema = new Schema({
    name:{
        type:String,
        trim:true,
        maxLength:150,
    },
    email:{
        type:String,
        trim:true,
        unique:true,
    },
    
    password:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'active',
    },
    
    verify:{
        type:Schema.Types.Boolean,
        default:false,
    },
    role:{
        type:Array,
        default:[],
    },
},{
    collection:COLLECTION_NAME,
    timestamps:true,
});

//Export the model
module.exports = model(DOCUMENT_NAME, shopSchema);