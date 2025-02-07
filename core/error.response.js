'use strict'

const StatusCode ={
    Forbidden:403,
    Conflict:409,
}

const ReasonStatusCode = {
    Forbidden:'Bad Request Error',
    Conflict:'Conflict Error',
}

const{
    StatusCodes,
    reasonPhrases
} = require('../utils/httpStatusCode')
class ErrorResponse extends Error { // kế thừa từ class Error
    constructor(message,status){
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.Conflict,Status = StatusCode.Conflict){
        super(message,Status)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.Forbidden,Status = StatusCode.Forbidden){
        super(message,Status)
    }
}

class AuthFailureError extends ErrorResponse {
    constructor(message = reasonPhrases.UNAUTHORIZED,Status = StatusCodes.UNAUTHORIZED){
        super(message,Status)
    }
}

class NotFoundError extends ErrorResponse {
    constructor(message = reasonPhrases.NOT_FOUND,Status = StatusCodes.NOT_FOUND){
        super(message,Status)
    }
}


class ForbiddenError extends ErrorResponse {
    constructor(message = reasonPhrases.FORBIDDEN,Status = StatusCodes.FORBIDDEN){
        super(message,Status)
    }
}


module.exports = {ConflictRequestError,BadRequestError,AuthFailureError, NotFoundError,ForbiddenError}