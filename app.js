const express = require('express');
const morgan = require('morgan');
const {default:helmet} = require('helmet');
const compression = require('compression');


const app = express();

// init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended:true}));



// init db
require('./dbs/db.js');
const {checkoverload} =require('./helps/checkconnect.js');
// checkoverload();
// init routes

app.use('/',require('./routes'));
// init error handling

app.use((req,res,next)=>{ // Ham bao dong xu li loi
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error,req,res,next)=>{ //Middleware này bắt tất cả lỗi được chuyển đến nó, không chỉ lỗi 404. Nó sẽ trả về một đối tượng JSON chứa mã trạng thái và thông báo lỗi.
    const statuscode = error.status || 500;
    res.status(statuscode).json({
       status:'error',
       code: statuscode,
       message: error.message || 'Internal Server Error'
    })
})
module.exports = app;