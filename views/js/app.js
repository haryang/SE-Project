var app = angular.module('quizApp', ['ngRoute']);

app.controller('registerCtrl', function($scope, $location, $rootScope, $http) {
	$scope.error = false;
	$scope.checkEmail = false;

	$scope.user = {
		email:'',
		firstName:'',
		lastName:'',
		passwd1:'',
		passwd2:''
	}

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

	$scope.test = function(obj) {
		var re=/^\w+@[a-z0-9]+\.[a-z]+$/i;
		if(re.test(obj)) {
			$scope.checkEmail = false;
			$scope.error = false;
		}
		else {
			$scope.checkEmail = true;
			$scope.error = true;
		}
	}

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$scope.register = function (user){
		if ($scope.user.email == "" || $scope.user.firstName == "" || $scope.user.lastName == "" || $scope.user.passwd1 == "" || $scope.user.passwd2 == "") {
			alert("We need your complete personal information! Please fill in all the blanks.");
		}
		else {
			$http.post('/register', user).success(function (response) {
				if (response != "0") {
					alert("Success! Please login with your registered email \"" + user.email + "\" and password you created.");
					$rootScope.currentUser = response;
					$location.path('/login');
				} else {
					alert("Sorry, the account \"" + user.email + "\" has already been registered! Please create a new one.")
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
			alert("Email or password does not match! Please login again.");
		})
	}
});

app.controller('homeCtrl', function ($q, $scope, $rootScope, $http, $location, $interval) {
	$rootScope.wrong = 0;
	$rootScope.report = {type:'',wrong:[]};
	$scope.exam = function (){
		var now = new Date().valueOf();
		var timeLimit = now + 2*60*60*1000;
		var counting = $interval(function () {
			var current = new Date().valueOf();
			var diff = timeLimit - current;
			var Hours = Math.floor(diff%(1000*60*60*24)/(1000*60*60));
			var Minutes = Math.floor(diff%(1000*60*60*24)%(1000*60*60)/(1000*60));
			var Seconds = Math.floor(diff%(1000*60*60*24)%(1000*60*60)%(1000*60)/1000);
			$rootScope.Hours = Hours<10?'0'+Hours:Hours;
			$rootScope.Minutes =Minutes<10?'0'+Minutes:Minutes;
			$rootScope.Seconds =Seconds<10?'0'+Seconds:Seconds;
			if ($rootScope.Hours == 0 && $rootScope.Minutes == 0 && $rootScope.Seconds ==0){
				//TODO submit quiz code here.
			}
		},1000);

		$http.get('/quiz').success(function (response) {
			$rootScope.questions = response;
			console.log($rootScope.questions);
			$location.path('/exam/0');
		});
	}
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			checkSession.check();
			$rootScope.currentUser = undefined;
		})
	};

});



//app.controller('profileCtrl', function ($scope, $rootScope, $http, $location) {
//	//$scope.currentUser.firstNameNew = $scope.currentUser.firstName;
//	//$scope.currentUser.lastNameNew = $scope.currentUser.lastName;
//	//$scope.currentUser.passwd1New = $scope.currentUser.passwd1;
//	//$scope.save =  function(user) {
//	//	$scope.user.firstName = $scope.currentUser.firstNameNew;
//	//	$scope.user.lastName = $scope.currentUser.lastNameNew;
//	//	$scope.user.passwd1 = $scope.currentUser.passwd1New;
//	//}
//});

app.controller('profileCtrl', function ($q, $scope, $rootScope, $http, $location) {
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			checkSession.check();
			$rootScope.currentUser = undefined;
		})
	};
});

app.controller('aboutCtrl', function ($q, $scope, $rootScope, $http, $location) {
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			checkSession.check();
			$rootScope.currentUser = undefined;
		})
	};
});

app.controller('examCtrl', function ($q, $scope, $rootScope, $http, $location, $routeParams) {
	$scope.index =Number($routeParams.id);
	$scope.previous = function(){
		$location.path('/exam/'+(Number($routeParams.id) - 1));
		if ($scope.choice){
			$rootScope.questions[$scope.index].answer = $scope.choice;
		}

	};
	$scope.next = function(){
		$location.path('/exam/'+(Number($routeParams.id) + 1));
		if ($scope.choice){
			$rootScope.questions[$scope.index].answer = $scope.choice;
		}
	};
	$scope.quit = function () {
		$rootScope.questions = [];
		$location.url('/home')
	};
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			checkSession.check();
			$rootScope.currentUser = undefined;
		})
	};
	$scope.submit = function () {
		var epwrong = 0, gkwrong = 0, mawrong = 0, pmwrong = 0, scmwrong = 0, sqmwrong = 0, svvwrong = 0;
		var postData = {
			"username":$rootScope.currentUser.username,
			"mode": "quiz",
			"time": new Date(),
			"score": 0,
			"category": null,
			epScore: 0,
			gkScore: 0,
			maScore: 0,
			pmScore: 0,
			scmScore: 0,
			sqmScore: 0,
			svvScore: 0
		};
		$rootScope.questions.forEach(function (value, index, array) {
			if (value.answer != value.correctChoice){
				$rootScope.wrong ++;
				$rootScope.report.wrong.push(value);
				switch (value.category){
					case 'ep':
						epwrong ++;
						break;
					case 'gk':
						gkwrong ++;
						break;
					case 'mam':
						mawrong ++;
						break;
					case 'pm':
						pmwrong ++;
						break;
					case 'scm':
						scmwrong ++;
						break;
					case 'sqm':
						sqmwrong ++;
						break;
					case 'SVV':
						svvwrong ++;
						break;
				}

			}

			if (index == array.length - 1){
				postData.score = Math.floor((1-($rootScope.wrong/80))*100);
				$rootScope.report.score = postData.score;
				$rootScope.report.epScore = (1-(epwrong/11))*100;
				$rootScope.report.gkScore = (1-(gkwrong/11))*100;
				$rootScope.report.maScore = (1-(mawrong/11))*100;
				$rootScope.report.pmScore = (1-(pmwrong/11))*100;
				$rootScope.report.scmScore = (1-(scmwrong/12))*100;
				$rootScope.report.sqmScore = (1-(sqmwrong/12))*100;
				$rootScope.report.svvScore = (1-(svvwrong/12))*100;
				postData.epScore = $rootScope.report.epScore;
				postData.gkScore = $rootScope.report.gkScore;
				postData.maScore = $rootScope.report.maScore;
				postData.pmScore = $rootScope.report.pmScore;
				postData.scmScore = $rootScope.report.scmScore;
				postData.sqmScore = $rootScope.report.sqmScore;
				postData.svvScore = $rootScope.report.svvScore;
				$http.post('/saveRecord', postData).success(function () {
					$location.url('/report');
				});
			}
		});
	};


/*
	var count = {count: 10};

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

	});*/
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
		when('/about', {
			templateUrl: 'partials/about.html',
			controller: 'aboutCtrl',
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
			//controller: 'reportCtrl',
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

