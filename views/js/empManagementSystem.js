var app = angular.module("myApp", ["ngRoute", "infinite-scroll"]);
app.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var parsedFile = $parse(attrs.fileModel);
            var parsedFileSetter = parsedFile.assign;

            element.bind('change', function() {
                scope.$apply(function() {
                    parsedFileSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
app.factory('employeeService', function($http) {
	var employeesObj = {};
	employeesObj.query = function() {
		return $http.get('/employees');
	}

	employeesObj.loadMore = function(rawSource, curSource) {
		curSource = rawSource.slice(0, curSource.length + 10);
		return curSource;
	}

	employeesObj.create = function(file, newemployee) {
		var fd = new FormData();
		fd.append('userProfile', file.upload);
		fd.append('fName', newemployee.fName);
		fd.append('lName', newemployee.lName);
		fd.append('title', newemployee.title);
		fd.append('phone', newemployee.phone);
		fd.append('email', newemployee.email);
		fd.append('department', newemployee.department);
		fd.append('manager', newemployee.manager);
		return $http.post('/upload', fd, {
			transformRequest: angular.identity,
			headers: { 'Content-Type': undefined}
		});
	}

	employeesObj.createWithoutImage = function(newemployee) {
		return $http.post('/employees', newemployee);
	}

	employeesObj.get = function(id) {
		return $http.get('/employees/' + id);
	}

	employeesObj.getByManager = function(id, manager) {
		return $http.get('/employees/' + id + '/' + manager);
	}

	employeesObj.getByNumberOfReports = function(id, fName, lName) {
		return $http.get('/employees/' + id + '/' + fName + '/' + lName);
	}

	employeesObj.update = function(file, updatedEmployee) {
		var fd = new FormData();
		fd.append('userProfile', file.upload);
		fd.append('id', updatedEmployee.id);
		fd.append('fName', updatedEmployee.fName);
		fd.append('lName', updatedEmployee.lName);
		fd.append('title', updatedEmployee.title);
		fd.append('phone', updatedEmployee.phone);
		fd.append('email', updatedEmployee.email);
		fd.append('department', updatedEmployee.department);
		fd.append('manager', updatedEmployee.manager);
		return $http.put('/upload', fd, {
			transformRequest: angular.identity,
			headers: { 'Content-Type': undefined}
		});
	}

	employeesObj.updateWithoutImage = function(updatedEmployee) {
		return $http.put('/employees/' + updatedEmployee.id, updatedEmployee);
	}

	employeesObj.delete = function(id) {
		return $http.delete('/employees/' + id);
	}

	employeesObj.upload = function(file) {
		var fd = new FormData();
		fd.append('userProfile', file.upload);
		return $http.post('/upload', fd, {
			transformRequest: angular.identity,
			headers: { 'Content-Type': undefined}
		});
	}

	return employeesObj;
});

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "employeeList.html",
        controller : "employeeListCtrl"
    })
    .when("/addEmployee", {
        templateUrl : "addEmployee.html",
        controller : "addEmployeeCtrl"
    })
    .when("/editEmployee/:id", {
    	templateUrl : "editEmployee.html",
    	controller : "editEmployeeCtrl"
    })
	.when("/employeeList/:id/:manager", {
    	templateUrl : "employeeList.html",
    	controller : "managerListCtrl"
    })
	.when("/employeeList/:id/:fName/:lName", {
    	templateUrl : "employeeList.html",
    	controller : "numberOfReportsListCtrl"
    })
    .otherwise({
      redirectTo: '/employeeList.html'
    });
});

app.controller('employeeListCtrl', function ($scope, employeeService, $route) {
	employeeService.query().success(function(data) {
		var source = data;
		$scope.employees = source.slice(0, 10);
		$scope.loadMore = function(rawSource, curSource) {
			$scope.employees = employeeService.loadMore(source, $scope.employees);
    	}

	});
	
	$scope.deleteEmployee = function(id) {	
		employeeService.delete(id).success(function(data) {
			$scope.employees = data;
		});
		
		$route.reload();
	}
});

app.controller("managerListCtrl", function ($scope, employeeService, $routeParams, $route) {
	employeeService.getByManager($routeParams.id, $routeParams.manager).success(function(data) {
		$scope.employees = data;
	});
});

app.controller("numberOfReportsListCtrl", function ($scope, employeeService, $routeParams, $route) {
	employeeService.getByNumberOfReports($routeParams.id, $routeParams.fName, $routeParams.lName).success(function(data) {
		$scope.employees = data;
	});
});

app.controller("addEmployeeCtrl", function ($scope, employeeService, $routeParams, $route, $timeout) {
	$scope.file = {};
	$scope.default = "./images/profile.png";
	$scope.saveChanges = function() {	
		if (typeof $scope.file.upload === 'undefined') {
			$scope.newemployee.image = "./images/profile.png";
			employeeService.createWithoutImage($scope.newemployee);
		} else {
			employeeService.create($scope.file, $scope.newemployee);
		}
		$route.reload();
	}

	employeeService.query().success(function(data) {
		$scope.employees = data;
	});

    $scope.photoChanged = function(files) {
        if (files.length > 0 && files[0].name.match(/\.(png|jpeg|jpg)$/)) {
            var file = files[0];
			console.log(file);
			profileName = file.name;
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function(e) {
                $timeout(function() {
                    $scope.thumbnail = {};
                    $scope.thumbnail.dataUrl = e.target.result;
                });
            };
        } else {
            $scope.thumbnail = {};
        }
    };
});

app.controller("editEmployeeCtrl", function ($scope, employeeService, $routeParams, $route, $timeout) {
	$scope.default = "./images/profile.png";
	$scope.file = {};
	employeeService.get($routeParams.id).success(function(data) {
		$scope.newemployee = data[0];
		$scope.thumbnail = {};
		$scope.thumbnail.dataUrl = $scope.newemployee.image;
	});

	employeeService.query().success(function(data) {
		$scope.employees = data;
		employeeService.getByNumberOfReports($scope.newemployee.id, $scope.newemployee.fName, $scope.newemployee.lName).success(function(data) {
			var excluded = [];
			excluded.push($scope.newemployee.id);
			for (var i in data) {
				excluded.push(data[i].id);
			}

			while (excluded.length > 0) {
				for (var j in $scope.employees) {
					var index = excluded.indexOf($scope.employees[j].id);
					if (index !== -1) {
						$scope.employees.splice(j, 1);
						excluded.splice(index, 1);
					}
				}
			}

		});
	});
	
	$scope.saveChanges = function() {
		if (typeof $scope.file.upload === 'undefined') {
			employeeService.updateWithoutImage($scope.newemployee);			
		} else {
		 	employeeService.update($scope.file, $scope.newemployee);
		}

		$route.reload();
	}

	
    $scope.photoChanged = function(files) {
        if (files.length > 0 && files[0].name.match(/\.(png|jpeg|jpg)$/)) {
            var file = files[0];
			profileName = file.name;
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function(e) {
                $timeout(function() {
					$scope.thumbnail = {};
                    $scope.thumbnail.dataUrl = e.target.result;
                });
            };
        } else {
            $scope.thumbnail = {};
        }
    };
});


app.filter('searchFor', function(){
	return function(employees, searchString){
		if(!searchString){
			return employees;
		}

		var result = [];
		angular.forEach(employees, function(employee){
			if(employee.fName.toLowerCase() == searchString.toLowerCase() ||
				 employee.lName.toLowerCase() == searchString.toLowerCase() ||
				 employee.title.toLowerCase() == searchString.toLowerCase() ||
				 employee.department.toLowerCase() == searchString.toLowerCase() ||
				 employee.manager.toLowerCase() == searchString.toLowerCase()) {
				result.push(employee);
			}
		});

		return result;
	};
});