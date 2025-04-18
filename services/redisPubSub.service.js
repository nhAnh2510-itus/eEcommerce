'use strict'
const Redis = require('redis')

class RedisPubSub{
    constructor(){
        this.subscribe = Redis.createClient()
        this.publish = Redis.createClient()
    }
}