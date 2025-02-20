'use strict'
const _ = require('lodash') // công dụng là để so sánh 2 object hoặc array có giống nhau không 

const {Types}  = require('mongoose')


const convertToObjectId = id =>{
    return new Types.ObjectId(id)
}
const getInfoData = ({fields = [], object = {}})=>{
    return _.pick(object,fields)
}

const getSelectData = (select =[])=>{
    return Object.fromEntries(select.map(item => [item,1]))
}

const unGetSelectData = (select =[])=>{
    return Object.fromEntries(select.map(item => [item,0]))
}

const removeUndefinedObject = obj =>{
    Object.keys(obj).forEach(k => {
        if( obj[k] === null || obj[k] === undefined){
            delete obj[k]
        }
    })
    return obj
}

const updateNestedObjectParse = obj => {
    const result = {};
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        const response = updateNestedObjectParse(obj[key]);
         Object.keys(response).forEach(k=>{
              result[`${key}.${k}`] = response[k];
         })
        } else {
        result[key] = obj[key];
        }
    });
    console.log('result', result);
    return result;
  };

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParse,
    convertToObjectId
}