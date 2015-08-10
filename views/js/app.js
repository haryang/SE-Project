var app = angular.module('quizApp', ['ngRoute']);

app.controller('registerCtrl', function($scope, $location, $rootScope, $http) {
	$scope.error = false;

	// $scope.$watch('username',function() {$scope.verify();});
	// $scope.$watch('passwd1',function() {$scope.verify();});
	// $scope.$watch('passwd2',function() {$scope.verify();});

	$scope.verify = function () {

		if ($scope.user.passwd1 !== $scope.user.passwd2) {
			$scope.error = true;
			$scope.myClass = "has-error";
		}
		else {
			$scope.error = false;
			$scope.myClass = "";
		}

	}

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$scope.register = function (user){
		if ($scope.user.email == "" || $scope.user.firstName == "" || $scope.user.lastName == "" || $scope.user.passwd1 == "") {
			alert("Please fill in all the blanks");
		}
		else {
			$http.post('/register', user).success(function (response) {
				if (response != "0") {
					alert("Success!");
					$rootScope.currentUser = response;
					$location.path('/login');
				} else {
					alert("Sorry, your account \"" + user.email + "\" has been created")
				}
			})
		}
	}

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



});

app.controller('loginCtrl', function ($scope, $rootScope, $http, $location) {
	$scope.login = function (user){
		$http.post('/login', user).success(function (response){
			$rootScope.currentUser = response;
			$location.url('/home');
		}).error(function (err) {
			alert("email or password not match");
		})
	}
});

app.controller('homeCtrl', function ($scope, $rootScope, $http, $location) {
	$scope.exam = function (user){
		$http.post('/exam', user).success(function (response){
			$rootScope.currentUser = response;
			$location.url('/exam');
		})
	}
});

app.controller('profileCtrl', function ($scope, $rootScope, $http, $location) {
	//$scope.currentUser.firstNameNew = $scope.currentUser.firstName;
	//$scope.currentUser.lastNameNew = $scope.currentUser.lastName;
	//$scope.currentUser.passwd1New = $scope.currentUser.passwd1;
	//$scope.save =  function(user) {
	//	$scope.user.firstName = $scope.currentUser.firstNameNew;
	//	$scope.user.lastName = $scope.currentUser.lastNameNew;
	//	$scope.user.passwd1 = $scope.currentUser.passwd1New;
	//}
});

app.controller('examCtrl', function ($q, $scope, $rootScope, $http, $location, $routeParams) {
	$scope.previous = function(){
		$location.path('/exam/'+(Number($routeParams.id) - 1));
		$scope.questions[0][$routeParams.id].choice=$scope.choice;
	}
	$scope.next = function(){
		$location.path('/exam/'+(Number($routeParams.id) + 1));
		$scope.questions[0][$routeParams.id].choice=$scope.choice;
		console.log($scope.questions[0])
	}


	var count = {count: 10};
	/*var GK =  $http.post('/getGKModel', count).success(function(res){
		console.log(res)
	});*/
	function test (){
		var deferred = $q.defer();
		$http.post('/getGKModel', count).success(function(data){
			deferred.resolve(data);}).error(function() {
			deferred.reject();
		});
		return deferred.promise;
	}

	var GK = test();

	$q.all([GK]).then(function (totalResponse) {
		$scope.questions = totalResponse;
		$scope.currentQuestion = $scope.questions[0][$routeParams.id];

	});
});


app.config(function ($routeProvider, $httpProvider, $locationProvider) {
	var checkLoggedIn = function ($q, $timeout, $http, $location, $rootScope) {
		var deferred = $q.defer();
		$http.get('/loggedin').success(function (user) {
			$rootScope.errorMessage = null;
			if (user !== '0'){
				$rootScope.currentUser = user;
				$rootScope.isLoggedIn = (user != 0);
				deferred.resolve();
			} else {
				$rootScope.errorMessage = "You are not login yet."
				deferred.reject();
				$location.url('/login');
				$rootScope.isLoggedIn = (user != 0);
			}
		})
	};
	$locationProvider.html5Mode(true);
	$routeProvider.
		when('/', {
			templateUrl: 'partials/login.html',
			controller: 'loginCtrl'
		}).
		when('/login', {
			templateUrl: 'partials/login.html',
			controller: 'loginCtrl'
		}).
		when('/home', {
			templateUrl: 'partials/home.html',
			controller: 'homeCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/profile', {
			templateUrl: 'partials/profile.html',
			controller: 'profileCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/register', {
			templateUrl: 'partials/register.html',
			controller: 'registerCtrl'
		}).
		when('/exam/:id', {
			templateUrl: 'partials/exam.html',
			controller: 'examCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/practice', {
			templateUrl: 'partials/practice.html',
			controller: 'practiceCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/report', {
			templateUrl: 'partials/report.html',
			controller: 'reportCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/404', {
			templateUrl: 'partials/404.html'
		})
		.
		otherwise({
			redirectTo: '/'
		});
});

