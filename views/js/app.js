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
			console.log(user);
			$rootScope.currentUser = response;
			$location.url('/home');
		}).error(function (err) {
			console.log(err);
			alert("email or password not match");
		})
	}
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
			templateUrl: 'partials/home.html'

		}).
		when('/profile', {
			templateUrl: 'partials/profile.html',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/register', {
			templateUrl: 'partials/register.html',
			controller: 'registerCtrl'
		}).
		when('/quiz', {
			templateUrl: 'partials/quiz.html',
			controller: 'quizCtrl',
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

