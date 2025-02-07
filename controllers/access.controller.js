'use strict'

const AccessService = require("../services/access.service")
const {OK,Created,SuccessResponse} = require('../core/success.response')

//Thường phụ thuộc vào trạng thái của yêu cầu (request), nên sử dụng instance.
//Nếu bạn cần lưu trữ trạng thái của yêu cầu (request) giữa các phương thức, bạn cần sử dụng instance.
//Nếu bạn cần tạo một số instance-specific data, bạn cần sử dụng instance. 
//Dùng instance trong Controller để tận dụng khả năng mở rộng, lưu trạng thái, và quản lý các phương thức dễ dàng.

class AccessController {

    handlerRefreshToken = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get Token success',
            metadata: await AccessService.handlerRefreshToken(req.body.refreshToken)
        }).Send(res)
    }

    logout = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Logout success',
            metadata: await AccessService.logout(req.keyStore)
        }).Send(res)
    }


    login = async (req, res, next)=>{
        new SuccessResponse({
            metadata: await AccessService.Login(req.body)
        }).Send(res)
    }

    signup = async (req, res, next)=> {
        // try{
        //     console.log('[P]::signup::',req.body)
        //     res.status(201).json(await AccessService.signup(req.body))
        // }catch(err){
        //    next(err) 
        // }
        new Created({
            message:'Registered OK',
            metadata: await AccessService.signup(req.body),
            options:{
                limit:10,
            }
    }).Send(res)
    }

}

module.exports = new AccessController();