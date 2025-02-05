'use strict'
const _ = require('lodash') // công dụng là để so sánh 2 object hoặc array có giống nhau không 



const getInfoData = ({fields = [], object = {}})=>{
    return _.pick(object,fields)
}

module.exports = {
    getInfoData
}