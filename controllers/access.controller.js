'use strict'

const AccessService = require("../services/access.service")

//Thường phụ thuộc vào trạng thái của yêu cầu (request), nên sử dụng instance.
//Nếu bạn cần lưu trữ trạng thái của yêu cầu (request) giữa các phương thức, bạn cần sử dụng instance.
//Nếu bạn cần tạo một số instance-specific data, bạn cần sử dụng instance. 
//Dùng instance trong Controller để tận dụng khả năng mở rộng, lưu trạng thái, và quản lý các phương thức dễ dàng.

class AccessController {

    signup = async (req, res, next)=> {
        try{
            console.log('[P]::signup::',req.body)
            res.status(201).json(await AccessService.signup(req.body))
        }catch(err){
           next(err) 
        }
    }

}

module.exports = new AccessController();