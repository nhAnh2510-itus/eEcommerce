'use strict'

const asyncHandler = fn =>{ // để bắt lỗi trong async function và không dùng try catch
    return (req,res,next)=>{
        fn(req,res,next).catch(next)
    }
}

module.exports = asyncHandler