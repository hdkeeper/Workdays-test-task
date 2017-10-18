'use strict';
const _ = require('lodash');
const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;

let WorkdaySchema = new mongoose.Schema({
    employee: {type: Types.ObjectId, ref: 'Employee', index: true, required: true},
    status: {type: String, required: true},
    date: {type: Date, index: true, required: true},
    hours: Number,
    notes: String,
});

WorkdaySchema.statics.pickFields = function (obj) {
    return _.pick( obj, 'employee status date hours notes'.split(' '))
};

WorkdaySchema.statics.maxWorkHoursPerDay = 8;

const isWork = function (status) {
    return /work$/i.test(status)
};

WorkdaySchema.statics.isWork = isWork;


/*
Возможные варианты:
В базе есть sick/vacation, добавляем work/remoteWork - ОШИБКА
В базе есть work/remoteWork, добавляем work/remoteWork - проверить сумму часов
В базе есть что-то, добавляем sick/vacation - ОШИБКА
В базе нет ничего, добавляем что-то - можно
*/
WorkdaySchema.post('validate', function (newDoc, next) {
    const Employee = require('./Employee');
    const Workday = require('./Workday');

    // Check employee ref
    Employee.count({_id: newDoc.employee})
    .then( function (empCount) {
        if (empCount == 0)
            return next( new Error('Employee not found'));

        // Check hours field
        if (isWork(newDoc.status) && !newDoc.hours)
            return next( new Error("Field 'hours' is missing"));

        // Check against already saved workdays
        Workday.find({employee: newDoc.employee, date: newDoc.date})
        .then( function (savedDocs) {
            if (savedDocs.length) {
                if (isWork( newDoc.status)) {
                    let savedWorkDays = savedDocs.filter( e => isWork( e.status) )
                    if (savedWorkDays.length) {
                        // Check sum of hours
                        if (_.sum( savedWorkDays.map( e => e.hours)) + newDoc.hours > Workday.maxWorkHoursPerDay)
                            return next( new Error("Work hours per day limit exceeded"));
                    }
                    else return next( new Error("Given date already exists"));
                }
                else return next( new Error("Given date already exists"));
            }

            // Ok to proceed
            next();
        })
        .catch( err => next( new Error(err)) );
    })
    .catch( err => next( new Error(err)) );
});



module.exports = mongoose.model('Workday', WorkdaySchema, 'workdays');

