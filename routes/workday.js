'use strict';
const _ = require('lodash');
const router = require('express').Router();
const moment = require('moment');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Employee = require('../model/Employee');
const Workday = require('../model/Workday');


function makeFilter(obj) {
    let cr = {};
    if (obj.employee)
        cr.employee = ObjectId( obj.employee);

    if (obj.from)
        _.set( cr, 'date.$gte', new Date(obj.from));

    if (obj.to)
        _.set( cr, 'date.$lt', moment(obj.to).add( 1, 'day').toDate());

    return cr;
}


// GET /workday ? limit, skip, employee, from, to
router.get('/', function (req, res) {
    let filter = {}, opts = {limit: 100, sort: {date: 1}};
    try {
        filter = makeFilter( req.query);
        'limit skip'.split(' ').forEach( function (param) {
            if (req.query[param])
                opts[param] = parseInt( req.query[param]);
        });
    }
    catch (ex) {
        return res.status(400).send({error: ex.toString()})
    }

    Workday.find( filter, null, opts)
    .populate('employee', 'name')
    .then( function (found) {
        res.send( found.map( function (e) {
            let r = {
                id: e._id,
                employee: {
                    id: e.employee._id,
                    name: e.employee.name
                },
                date: moment(e.date).format('YYYY-MM-DD')
            };
            _.assign( r, _.pick( e, 'status hours notes'.split(' ')));
            return r;
        }));
    })
    .catch( err => res.status(500).send({error: err.toString()}) );
})

// GET /workday/export ? limit, skip, employee, from, to
router.get('/export', function (req, res) {
    let filter = {}, opts = {sort: {date: 1}};
    try {
        filter = makeFilter( req.query);
        'limit skip'.split(' ').forEach( function (param) {
            if (req.query[param])
                opts[param] = parseInt( req.query[param]);
        });
    }
    catch (ex) {
        return res.status(400).send({error: ex.toString()})
    }

    res.set('Content-Type', 'application/json');
    let cursor = Workday.find( filter, null, opts).cursor();
    let isFirst = true;
    cursor.eachAsync( function (doc) {
        return new Promise( function (resolve, reject) {
            let data = '';
            if (isFirst) {
                data = '[';
                isFirst = false;
            }
            else data = ',';

            let o = {
                id: doc._id,
                date: moment( doc.date).format('YYYY-MM-DD')
            };
            _.assign( o, _.pick( doc, 'employee status hours notes'.split(' ')));
            data += JSON.stringify(o) + '\n';
            res.write( data, () => resolve(true) );
        });
    })
    .then( function () {
        res.end( ']', function () {
            cursor.close();
        });
    })
    .catch( err => res.status(500).send({error: err.toString()}) );
})

// GET /workday/stats ? employee, from, to
.get('/stats', function (req, res) {
    let filter = {};
    try {
        filter = makeFilter( req.query);
    }
    catch (ex) {
        return res.status(400).send({error: ex.toString()})
    }

    Workday.aggregate([
        {$match: filter},
        {$group: {
            _id:  {
                employee: '$employee',
                status: '$status'
            },
            count: {$sum: 1},
            hours: {$sum: '$hours'}
        }},
        {$group: {
            _id: '$_id.employee',
            summary: {$push: {
                status: '$_id.status',
                count: '$count',
                hours: '$hours'
            }}
        }},
    ])
    .then( function (data) {
        data.forEach( function (p) {
            p.employee = p._id;
            delete p._id;
        });

        return Employee.populate( data, {path: 'employee', select: 'name'});
    })    
    .then( function (data) {
        data.forEach( function (p) {
            p.employee = {
                id: p.employee._id,
                name: p.employee.name
            };
        });

        res.send( data);
    })
    .catch( err => res.status(500).send({error: err.toString()}) );
});


module.exports = router;
