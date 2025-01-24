'use strict';
const mongoose = require('mongoose');
const process = require('process');
const os = require('os');

const _SECONDS = 5000

const Countconnect=() =>{
    const Numconnect = mongoose.connection.length;
    console.log(`Number of connection: ${Numconnect}`);
}

// check overload
const checkoverload =()=>{
    setInterval(()=>{
        const Numconnect = mongoose.connection.length;
        const Numcores = os.cpus().length;
        const memory = process.memoryUsage().rss;
        // example maximun number of connections base on number of cores
        const maxconnect = Numcores * 5;
        console.log(`Active connection: ${Numconnect}`);
        console.log('Memory usage: ', memory/1024/1024,'MB');
        if(Numconnect > maxconnect){
            console.log('connection overload detected!');
            
        }
    },_SECONDS) // Monitor every 5 seconds
}

module.exports = {Countconnect,
    checkoverload
};
