'use strict';
const _ = require('lodash');
const mongoose = require('mongoose');

let EmployeeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    phone: String,
    notes: String,
});

EmployeeSchema.statics.pickFields = function (obj) {
    return _.pick( obj, 'name email phone notes'.split(' '))
};

module.exports = mongoose.model('Employee', EmployeeSchema, 'employees');

