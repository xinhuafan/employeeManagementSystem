'use strict';
module.exports = function(app) {
    var employeeList = require('../controllers/employeesController');
    app.route('/employees')
        .get(employeeList.listAllEmployees)
        .post(employeeList.newEmployee)
    app.route('/employees/:employeeId')
        .get(employeeList.getEmployee)
        .put(employeeList.editEmployee)
        .delete(employeeList.deleteEmployee);
    app.route('/employees/:employeeId/:employeeManager')
        .get(employeeList.getEmployeeByManager)
    app.route('/employees/:employeeId/:employeefName/:employeelName')
        .get(employeeList.getEmployeeByNumberofReports)
};