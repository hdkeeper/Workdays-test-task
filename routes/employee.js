'use strict';
const _ = require('lodash');
const router = require('express').Router();
const moment = require('moment');

const Employee = require('../model/Employee');
const Workday = require('../model/Workday');


// GET /employee - list
// ? limit, skip
router.get('/', function (req, res) {
    let opts = {limit: 100};
    try {
        'limit skip'.split(' ').forEach( function (param) {
            if (req.query[param])
                opts[param] = parseInt( req.query[param]);
        });
    }
    catch (ex) {
        return res.status(400).send({error: ex.toString()})
    }

    Employee.find({}, 'name email', opts)
    .then( function (found) {
        res.send( found.map( e => ({
            id: e._id,
            name: e.name,
            email: e.email,
        })));
    })
    .catch( err => res.status(500).send({error: err.toString()}) );
})

// GET /employee/empId - read
.get('/:id', function (req, res) {
    Employee.findById( req.params.id)
    .then( function (found) {
        if (!found)
            return res.status(404).send({error: 'Not found'});

        res.send( _.pickBy( found.toObject(), (v,k) => (k[0] != '_') ));
    })
    .catch( err => res.status(500).send({error: err.toString()}) );
})

// PUT /employee/ - create
.put('/', function (req, res) {
    Employee.create( Employee.pickFields( req.body))
    .then( created => res.send({id: created._id}) )
    .catch( err => res.status(500).send({error: err.toString()}) );
})

// POST /employee/empId - update
.post('/:id', function (req, res) {
    Employee.count({_id: req.params.id})
    .then( function (count) {
        if (!count)
            return res.status(404).send({error: 'Not found'});

        Employee.findByIdAndUpdate( req.params.id, Employee.pickFields( req.body))
        .then( () => res.send({ok: 'Updated'}) )
        .catch( err => res.status(500).send({error: err.toString()}) );
    })
    .catch( err => res.status(500).send({error: err.toString()}) );
})

// DELETE /employee/empId - delete
.delete('/:id', function (req, res) {
    Employee.count({_id: req.params.id})
    .then( function (count) {
        if (!count)
            return res.status(404).send({error: 'Not found'});

        Promise.all([
            Workday.remove({employee: req.params.id}),
            Employee.findByIdAndRemove( req.params.id)
        ])
        .then( () => res.send({ok: 'Deleted'}) )
        .catch( err => res.status(500).send({error: err.toString()}) );
    })
    .catch( err => res.status(500).send({error: err.toString()}) );
})


// GET /employee/empId/workday/wId - read
.get('/:empId/workday/:id', function (req, res) {
    Workday.findById( req.params.id)
    .then( function (found) {
        if (!found)
            return res.status(404).send({error: 'Not found'});

        let o = _.pickBy( found.toObject(), (v,k) => (k[0] != '_') );
        o.date = moment(o.date).format('YYYY-MM-DD');
        res.send(o);
    })
    .catch( err => res.status(500).send({error: err.toString()}) );
})

// PUT /employee/empId/workday - create
.put('/:empId/workday', function (req, res) {
    let newDoc = new Workday( Workday.pickFields( req.body));
    newDoc.employee = req.params.empId;

    newDoc.save()
    .then( created => res.send({id: created._id}) )
    .catch( err => res.status(500).send({error: err.toString()}) );
})

// POST /employee/empId/workday/wId - update
.post('/:empId/workday/:id', function (req, res) {
    Workday.findById(req.params.id)
    .then( function (found) {
        if (!found)
            return res.status(404).send({error: 'Not found'});  

        _.assign( found, Workday.pickFields( req.body));
        found.save()
        .then( () => res.send({ok: 'Updated'}) )
        .catch( err => res.status(500).send({error: err.toString()}) );
    })
    .catch( err => res.status(500).send({error: err.toString()}) );
})

// DELETE /employee/empId/workday/wId - delete
.delete('/:empId/workday/:id', function (req, res) {
    Workday.count({_id: req.params.id, employee: req.params.empId})
    .then( function (count) {
        if (!count)
            return res.status(404).send({error: 'Not found'});

        Workday.findByIdAndRemove( req.params.id)
        .then( () => res.send({ok: 'Deleted'}) )
        .catch( err => res.status(500).send({error: err.toString()}) );
    })
    .catch( err => res.status(500).send({error: err.toString()}) );
})


module.exports = router;
