'use strict';
const _ = require('lodash');
const rp = require('request-promise');


rp({uri: 'http://localhost:3000/employee/59e0b874061a4a1f7c49e324/workday',
    json: true,
    method: 'PUT',
    body: {
        date: '2017-10-13',
        status: 'remoteWork',
        hours: 8        
    }
})
.then( function (res) {
    console.log( JSON.stringify( res, null, 2) );
})
.catch( function (err) {
    console.log( JSON.stringify( err, null, 2));
    console.log( err.error.stack );
});
