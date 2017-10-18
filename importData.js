'use strict';
const fs = require('fs');
const zlib = require('zlib');
const readline = require('readline');
const mongoose = require('mongoose');
const moment = require('moment');

const settings = require('./config/settings');
const Employee = require('./model/Employee');
const Workday = require('./model/Workday');



// Main processing routine
function importData( inputFile) {
    let reader = readline.createInterface({
        input: fs.createReadStream( inputFile).pipe( zlib.createUnzip())
    });

    let count = 0;
    reader.on('line', function (line) {
        if (! /^\{/.test(line))
            return;
        
        count++;
        let rec = JSON.parse(line);
        Employee.findOneAndUpdate(
            {email: rec.email}, 
            {name: rec.name, email: rec.email}, 
            {upsert: true, new: true}
        )
        .then( function (emp) {
            return Workday.create({
                employee: emp._id,
                date: moment( rec.date, 'DD.MM.YYYY').toDate(),
                status: rec.status,
                hours: Workday.isWork( rec.status) ? 8 : null
            })
        })
        .catch( function (err) {
            console.error( err.toString());
            process.exit(1);
        });

    })
    .on('close', function () {
        console.log('Records processed:', count);
        process.exit();
    });
}


// Command line arguments
let argv = require('minimist')(process.argv);

// MongoDB setup
mongoose.Promise = global.Promise;
mongoose.connect( settings.mongodb.url, {useMongoClient: true})
.then( function () {
    return importData( argv._[2]);
    // 'data/workdays-testdata-04082017.json.gz'
})
.catch( function (err) {
    console.error(err.message);
    process.exit(1);
});
