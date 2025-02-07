'use strict'

const HEADER={
    API_KEY:'x-api-key',
    AUTHORIZATION:'Authorization',
}

const {findById} = require('../services/apiKey.service')

const apiKey = async(req,res,next)=>{
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();
        if(!key){
            return res.status(403).json({
                message:'Forbidden Error'
            })
        }
        const objKey = await findById(key)
        if(!objKey){
            return res.status(403).json({
                message:'Forbidden Error'
            })
        }
        req.objKey = objKey
        next()
    } catch (error) {
        console.error(error);
    res.status(500).json({ message: 'Internal Server Error' }); 
    }
}

const permission = (permission)=>{ // ham bao dong
    return (req,res,next)=>{
        if(!req.objKey.permissions){
            return res.status(403).json({
                message:'Permission Denied'
            })
        }
        const ValidPermission = req.objKey.permissions.includes(permission)
        if(!ValidPermission){
            return res.status(403).json({
                message:'Permission Denied'
            })
        }
        return next()
    }
}


module.exports = {
    apiKey,
    permission
}