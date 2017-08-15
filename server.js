var express = require('express');
var app = express();
var connection = require('express-myconnection');
var mysql = require('mysql');
var port = process.env.PORT || 8888;
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(
    connection(mysql, {
        host:     'localhost',
        port:     '3306',
        user:     'root',
        password: '',
        database: 'employeeManagementSystem'
    }, 'request')
);
var upload = multer({dest: './views/uploads/'});
var routes = require('./api/routes/employeesRoutes');
var method = routes.prototype;
app.post('/upload', upload.single('userProfile'), function(req, res, next) {
 	var file_path = './views/uploads/' + Date.now()+req.file.originalname;
	var file_name = './uploads/' + Date.now()+req.file.originalname;
	var temp_path = req.file.path;
	var src = fs.createReadStream(temp_path);
	var dest = fs.createWriteStream(file_path);		
	src.pipe(dest);
	src.on('end', function() {
        req.getConnection(function(err, connection) {
            var mid = null;
            if (req.body.manager != null) {
                mid = req.body.manager.substring(req.body.manager.indexOf("(") + 1, req.body.manager.indexOf(")"));
            }
            var data = {
                image: file_name,
                fName: req.body.fName,
                lName: req.body.lName,
                fullName: req.body.fName + " " + req.body.lName,
                title: req.body.title,
                phone: req.body.phone,
                email: req.body.email,
                department: req.body.department,
                manager: req.body.manager,
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
		src.on('error', function(err) { 
			res.write(JSON.stringify("Error"));
			res.end(); 
		});   
    });
});

app.put('/upload', upload.single('userProfile'), function(req, res, next) {
 	var file_path = './views/uploads/' + Date.now()+req.file.originalname;
	var file_name = './uploads/' + Date.now()+req.file.originalname;
	var temp_path = req.file.path;
	var src = fs.createReadStream(temp_path);
	var dest = fs.createWriteStream(file_path);		
	src.pipe(dest);
	src.on('end', function() {
        req.getConnection(function(err, connection) {
            var mid = null;
            if (req.body.manager != null) {
                mid = req.body.manager.substring(req.body.manager.indexOf("(") + 1, req.body.manager.indexOf(")"));
            }
            var data = {
                image: file_name,
                fName: req.body.fName,
                lName: req.body.lName,
                fullName: req.body.fName + " " + req.body.lName,
                title: req.body.title,
                phone: req.body.phone,
                email: req.body.email,
                department: req.body.department,
                manager: req.body.manager,
                managerID: mid
            };

            connection.query("UPDATE employees set ? WHERE id = ? ", [data, req.body.id], function(err, rows) {
                if (err) {
                    console.log("Error updating : %s", err);
                } else {
                    res.json(rows);
                }
            });
        });

		src.on('error', function(err) { 
			res.write(JSON.stringify("Error"));
			res.end(); 
		});   
    });
});

routes(app);
app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
});
app.listen(port);
console.log('user management restful api server started on: ' + port);


