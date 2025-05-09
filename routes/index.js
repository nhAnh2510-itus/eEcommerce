'use strict'

const express = require('express');
const { apiKey, permission } = require('../auth/checkauth');
const router = express.Router();
// Test middleware
router.use(apiKey)
router.use(permission('0000'))
router.use('/v1/api/carts',require('./cart'))
router.use('/v1/api/checkout',require('./checkout'))
router.use('/v1/api/inventory',require('./inventory'))
router.use('/v1/api/products',require('./product'))
router.use('/v1/api/discounts',require('./discount'))
router.use('/v1/api',require('./access'))




// router.get('',(req,res,next)=>{
//     res.status(200).json({
//         message:'Welcome to Shopdev'
//     })
// })

module.exports = router;