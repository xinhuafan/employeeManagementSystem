'use strict';
exports.listAllEmployees = function(req, res) {
    req.getConnection(function(err, connection) {
        connection.query('SELECT e.*, ifnull(m.reports, 0) as reports FROM employees e LEFT JOIN (SELECT managerID, COUNT(*) as reports FROM employees GROUP BY manager) m ON e.id = m.managerID', function(err, rows) {
            if (err) {
                console.log("Error Selecting: %s", err);
            } else {
                res.json(rows);
            }
        });
    });
};

exports.newEmployee = function(req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function(err, connection) {
        var mid = null;
        if (req.body.manager != null) {
            mid = req.body.manager.substring(req.body.manager.indexOf("(") + 1, req.body.manager.indexOf(")"));
        }
        var data = {
            image: input.image,
            fName: input.fName,
            lName: input.lName,
            fullName: input.fName + " " + input.lName,
            title: input.title,
            phone: input.phone,
            email: input.email,
            department: input.department,
            manager: input.manager,
            managerID: mid
        };

    connection.query("INSERT INTO employees set ? ", data, function(err, rows) {
            if (err) {
                console.log("Error inserting : %s", err);
            } else {
                res.json(rows);
            }
    });

    });
};

exports.getEmployee = function(req, res) {
    var id = req.params.employeeId;
    req.getConnection(function(err, connection) {
        connection.query('SELECT * FROM employees WHERE id = ? ', [id], function(err, rows) {
            if (err) {
                console.log("Error Selecting : %s", err);
            } else {
                res.json(rows);
            }
        });
    });
};

exports.getEmployeeByManager = function(req, res) {
    req.getConnection(function(err, connection) {
        var userID = req.params.employeeManager.substring(req.params.employeeManager.indexOf("(") + 1, req.params.employeeManager.indexOf(")"));
        connection.query('SELECT * FROM (SELECT e.*, ifnull(m.reports, 0) as reports FROM employees e LEFT JOIN (SELECT managerID, COUNT(*) as reports FROM employees GROUP BY manager) m ON e.id = m.managerID) k WHERE id = ?', [userID], function(err, rows) {
            if (err) {
                console.log("Error Selecting : %s", err);
            } else {
                res.json(rows);
            }
        });
    });
};

exports.getEmployeeByNumberofReports = function(req, res) {
    var id = req.params.employeeId;
    console.log(id);
    req.getConnection(function(err, connection) {
        connection.query('SELECT * FROM (SELECT e.*, ifnull(m.reports, 0) as reports FROM employees e LEFT JOIN (SELECT managerID, COUNT(*) as reports FROM employees GROUP BY manager) m ON e.id = m.managerID) k WHERE managerID = ? ', [id], function(err, rows) {
            if (err) {
                console.log("Error Selecting : %s", err);
            } else {
                res.json(rows);
            }
        });
    });
};

exports.editEmployee = function(req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var id = req.params.employeeId;
    req.getConnection(function(err, connection) {
        var mid = null;
        if (req.body.manager != null) {
            mid = req.body.manager.substring(req.body.manager.indexOf("(") + 1, req.body.manager.indexOf(")"));
        }
        var data = {
            image: input.image,
            fName: input.fName,
            lName: input.lName,
            fullName: input.fName + " " + input.lName,
            title: input.title,
            phone: input.phone,
            email: input.email,
            department: input.department,
            manager: input.manager,
            managerID: mid
        };

        connection.query("UPDATE employees set ? WHERE id = ? ", [data, id], function(err, rows) {
            if (err) {
                console.log("Error updating : %s", err);
            } else {
                console.log(rows.fullName);
                res.json(rows);
            }
        });
    });
};

exports.deleteEmployee = function(req, res) {
    var id = req.params.employeeId;
    req.getConnection(function(err, connection) {
        connection.query("DELETE FROM employees WHERE id = ? ", [id], function(err, rows) {
            if (err) {
                console.log("Error deleting : %s", err);
            } else {
                res.redirect('/employees');
            }
        });
    });
};