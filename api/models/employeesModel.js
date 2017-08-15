'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var employeeSchema = new Schema({
    image: {
        type: String,
        Required: 'kindly enter the profile url'
    },
    fName: {
        type: String,
        Required: 'kindly enter the first name'
    },
    lName: {
        type: String,
        Required: 'kindly enter the last name'
    },
    fullName: {
        type: String,
        Required: 'kindly enter the full name'
    },
    title: {
        type: String,
        Required: 'kindly enter the title'
    },
    phone: {
        type: String,
        Required: 'kindly enter the phone number'
    },
    email: {
        type: String,
        Required: 'kindly enter the email address'
    },
    department: {
        type: String,
        Required: 'kindly enter the department name'
    },
    manager: {
        type: String,
        Required: 'kindly enter the manager name'
    },
    managerID: {
        type: Integer,
        Required: 'kindly enter the manager ID'
    }
});

module.exports = mongoose.model('Employees', employeeSchema);
