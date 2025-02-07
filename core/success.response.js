'use strict'
const StatusCode ={
    OK:200,
    CREATED:201,
}

const ReasonStatusCode = {
    OK:'Success' ,
    CREATED:'Created'
}
class SuccessResponse {
    constructor({message,statuscode=StatusCode.OK,reasonStatusCode = ReasonStatusCode.OK,metadata = {}}){
        this.message = !message ? reasonStatusCode : message
        this.status = statuscode
        this.metadata = metadata
    }
    Send(res, headers ={}){
        return res.status(this.status).json(this)
    }
}

class OK extends SuccessResponse {
    constructor({message,metadata }){
        super({message,metadata}) // super gọi lại constructor của class cha
    }
}

class Created extends SuccessResponse {
    constructor({option={},message,statuscode=StatusCode.CREATED,reasonStatusCode=ReasonStatusCode.CREATED,metadata}){
        super({message,statuscode,reasonStatusCode,metadata,option})
    }
}

module.exports = {OK,Created,SuccessResponse}