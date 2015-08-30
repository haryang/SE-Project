var app = angular.module('quizApp', ['ngRoute','timer']);


app.controller('indexCtrl', function($scope, ObserverService) {
	$scope.$on('timer-stopped', function () {
		console.log('notify');
		ObserverService.notify('timeUp','timer');
	});
});

app.controller('registerCtrl', function($scope, $location, $rootScope, $http) {
	$scope.error = false;
	$scope.checkEmail = false;

	$scope.user = {
		email:'',
		firstName:'',
		lastName:'',
		passwd1:'',
		passwd2:''
	};

	$scope.verify = function () {

		if ($scope.user.passwd1 !== $scope.user.passwd2) {
			$scope.error = true;
			$scope.myClass = "has-error";
		}
		else {
			$scope.error = false;
			$scope.myClass = "";
		}

	};

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
	};

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
	};

	$scope.pressEnter = function (e) {
		if (e.keyCode == 13){
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
	};

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
	};

	$scope.pressEnter = function (e) {
		if (e.keyCode == 13){
			$scope.login();
		}
	};
});

app.controller('homeCtrl', function ($q, $scope, $rootScope, $http, $location, $interval) {

	$rootScope.wrong = 0;
	$rootScope.report = {type:'',wrong:[]};
	$scope.exam = function (){
		$rootScope.submited = false;
		$http.get('/quiz').success(function (response) {
			$rootScope.questions = response;
			console.log($rootScope.questions);
			$location.path('/exam/0');
		});
	};

	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			$rootScope.currentUser = undefined;
		})
	};

});

app.controller('profileCtrl', function ($q, $scope, $rootScope, $http, $location) {
	$scope.firstName = $rootScope.currentUser.firstName;
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			$rootScope.currentUser = undefined;
		})
	};

	$scope.save = function (currentUser) {
		if ($scope.currentUser.firstName == "" || $scope.currentUser.lastName == "" || $scope.currentUser.passwd1 == "" || $scope.currentUser.passwd2 == "") {
			alert("Please fill in all the blanks above!");
		}
		else {
			var postData = {
				passwd1: currentUser.passwd1,
				firstName: currentUser.firstName,
				lastName: currentUser.lastName
			};
		}
		$http.post('/updateProfile', postData).success(function (response) {
			if (response == 'success'){
				$scope.firstName = postData.firstName;
				alert('Success!');
			} else if (response == 'error') {
				alert('error')
			}
		})
	};

	$scope.pressEnter = function (e) {
		if (e.keyCode == 13){
			$scope.save();
		}
	};

	$scope.wrong = false;
	$scope.errorClass = "";
	$scope.currentUser.passwd1 = "";
	//$scope.currentUser.passwd2 = "";
	$scope.checkPasswd = function () {

		if ($scope.currentUser.passwd1 !== $scope.currentUser.passwd2) {
			$scope.wrong = true;
			$scope.errorClass = "has-error";
		}
		else {
			$scope.wrong = false;
			$scope.errorClass = "";
		}

	};

});

app.controller('aboutCtrl', function ($q, $scope, $rootScope, $http, $location) {
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			$rootScope.currentUser = undefined;
		})
	};
});

app.controller('examCtrl', function ($q, $scope, $rootScope, $http, $location, $routeParams, ObserverService) {
	var div = document.getElementById('div1');

	$scope.choose = function (index,choice) {
		$rootScope.questions[index].answer = choice;
	};

	$scope.jump = function (index) {
		console.log(index);
		$location.url('/exam/' + index)
	};

	$scope.mouseover = function () {

		startMove(div,{left: 0}, function () {
			startMove(div,{opacity: 100, height: 480});
		});
	};

	$scope.mouseout = function () {
		startMove(div,{height: 60}, function() {
			startMove(div, {opacity: 50, left: -295});
		});
	};

	function getStyle(obj, name) {
		if(obj.currentStyle) {
			return obj.currentStyle[name];
		}
		else {
			return getComputedStyle(obj, false)[name];
		}
	}

	function startMove(obj, json, fnEnd) {
		clearInterval(obj.timer);
		obj.timer=setInterval(function() {
			var bStop=true;

			for(var attr in json) {
				var cur=0;
				if(attr=="opacity") {
					cur=Math.round(parseFloat(getStyle(obj, attr))*100);
				}
				else {
					cur=parseInt(getStyle(obj, attr));
				}

				var speed=(json[attr]-cur)/4;
				speed=speed>0?Math.ceil(speed):Math.floor(speed);

				if(cur!=json[attr])
					bStop=false;

				if(attr=="opacity") {
					obj.style.filter="alpha(opacity:" + (cur+speed) + ")";
					obj.style.opacity=(cur+speed)/100;
				}
				else {
					obj.style[attr]=cur+speed+"px";
				}
			}

			if(bStop) {
				clearInterval(obj.timer);
				if(fnEnd) fnEnd();
			}
		}, 30)
	}




	$rootScope.timer = true;
	$rootScope.report = {
		wrong:[]
	};
	$scope.index =Number($routeParams.id);
	$scope.previous = function(){
		$location.path('/exam/'+(Number($routeParams.id) - 1));
	};
	$scope.next = function(){
		$location.path('/exam/'+(Number($routeParams.id) + 1));
	};
	$scope.quit = function () {
		$rootScope.questions = [];
		$location.url('/home')
	};
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			$rootScope.currentUser = undefined;
		})
	};
	$scope.submit = function () {
		$rootScope.timer = false;
		$rootScope.submited = true;
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
					case 'mam': //TODO
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
					case 'SVV': //TODO
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
	$scope.$on('timer-stopped', function () {
		if (!$rootScope.submited){
			$scope.submit();
			$rootScope.timer = false;
		}
	});*/

	$scope.$on('$destroy', function () {
		$rootScope.timer = false;
	});

	ObserverService.detachByEventAndId('timeUp', 'exam');
	ObserverService.attach(function () {
		$scope.submit();
	}, 'timeUp', 'exam')
});

app.controller('practiseCtrl', function($scope, $routeParams, $http, $rootScope, $location, ObserverService) {
	$scope.index =Number($routeParams.id);
	$scope.previous = function(){
		$location.path('/practise/'+(Number($routeParams.id) - 1));
		if ($scope.choice){
			$rootScope.questions[$scope.index].answer = $scope.choice;
		}

	};
	$scope.next = function(){
		$location.path('/practise/'+(Number($routeParams.id) + 1));
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
			$rootScope.currentUser = undefined;
		})
	};
	$scope.submit = function () {
		$rootScope.submited = true;
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
					case 'mam': //TODO
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
					case 'SVV': //TODO
						svvwrong ++;
						break;
				}

			}

			if (index == array.length - 1){
				console.log($rootScope.questionDistribution.total);
				postData.score = Math.floor((1-($rootScope.wrong/$rootScope.questionDistribution.total))*100);
				$rootScope.report.score = postData.score;
				$rootScope.report.epScore = $rootScope.questionDistribution.data.EP?(1-(epwrong/$rootScope.questionDistribution.data.EP))*100:null;
				$rootScope.report.gkScore = $rootScope.questionDistribution.data.GK?(1-(gkwrong/$rootScope.questionDistribution.data.GK))*100:null;
				$rootScope.report.maScore = $rootScope.questionDistribution.data.MA?(1-(mawrong/$rootScope.questionDistribution.data.MA))*100:null;
				$rootScope.report.pmScore = $rootScope.questionDistribution.data.PM?(1-(pmwrong/$rootScope.questionDistribution.data.PM))*100:null;
				$rootScope.report.scmScore = $rootScope.questionDistribution.data.SCM?(1-(scmwrong/$rootScope.questionDistribution.data.SCM))*100:null;
				$rootScope.report.sqmScore = $rootScope.questionDistribution.data.SQM?(1-(sqmwrong/$rootScope.questionDistribution.data.SQM))*100:null;
				$rootScope.report.svvScore = $rootScope.questionDistribution.data.SVV?(1-(svvwrong/$rootScope.questionDistribution.data.SVV))*100:null;
				postData.epScore = $rootScope.report.epScore;
				postData.gkScore = $rootScope.report.gkScore;
				postData.maScore = $rootScope.report.maScore;
				postData.pmScore = $rootScope.report.pmScore;
				postData.scmScore = $rootScope.report.scmScore;
				postData.sqmScore = $rootScope.report.sqmScore;
				postData.svvScore = $rootScope.report.svvScore;
				/*$http.post('/saveRecord', postData).success(function () {
					$location.url('/report');
				});*/
				$location.url('/report');
			}
		});
	};

});

app.controller('practiseConfCtrl', function($q, $scope, $http, $rootScope, $location, ObserverService) {
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			$rootScope.currentUser = undefined;
		})
	};

	$rootScope.questions = [];
	$rootScope.report = {};
	$rootScope.report.wrong = [];
	$rootScope.wrong = 0;
	$rootScope.questionDistribution = {
		total : 0
	};
	$scope.GKValue = 5;
	$scope.EPValue = 5;
	$scope.MAValue = 5;
	$scope.PMValue = 5;
	$scope.SCMValue = 5;
	$scope.SQMValue = 5;
	$scope.SVVValue = 5;

	var postData = {};

	$scope.submit = function () {
		if ($scope.GK) {
			postData.GK = $scope.GKValue;
			$rootScope.questionDistribution.total += postData.GK
		}
		if ($scope.EP) {
			postData.EP = $scope.EPValue;
			$rootScope.questionDistribution.total += postData.EP
		}
		if ($scope.MA) {
			postData.MA = $scope.MAValue;
			$rootScope.questionDistribution.total += postData.MA
		}
		if ($scope.PM) {
			postData.PM = $scope.PMValue;
			$rootScope.questionDistribution.total += postData.PM
		}
		if ($scope.SCM) {
			postData.SCM = $scope.SCMValue;
			$rootScope.questionDistribution.total += postData.SCM
		}
		if ($scope.SQM) {
			postData.SQM = $scope.SQMValue;
			$rootScope.questionDistribution.total += postData.SQM
		}
		if ($scope.SVV) {
			postData.SVV = $scope.SVVValue;
			$rootScope.questionDistribution.total += postData.SVV
		}

		$rootScope.questionDistribution.data = postData;

		$http.post('/practise', postData).success(function (response) {
			$rootScope.questions = response;
			$location.url('practise/0')
		})
	}
});

app.controller('reportCtrl', function ($q, $scope, $rootScope, $http, $location) {
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			$rootScope.currentUser = undefined;
		})
	};
});

app.controller('historyCtrl', function ($q, $scope, $rootScope, $http, $location) {
	$scope.logout = function () {
		$http.post('/logout',$rootScope.user).success(function () {
			$location.url('/');
			$rootScope.currentUser = undefined;
		})
	};
});

app.config(function ($routeProvider, $httpProvider, $locationProvider) {
	var checkLoggedIn = function ($q, $timeout, $http, $location, $rootScope) {
		var deferred = $q.defer();
		$http.get('/loggedin').success(function (user) {
			$rootScope.errorMessage = null;
			if (user !== '0'){
				$rootScope.currentUser =  user;
				$rootScope.isLoggedIn = (user != 0);
				deferred.resolve();
			} else {
				$rootScope.errorMessage = "You are not login yet.";
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
		when('/report', {
			templateUrl: 'partials/report.html',
			controller: 'reportCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/history', {
			templateUrl: 'partials/history.html',
			controller: 'historyCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/practise', {
			templateUrl: 'partials/practiseConf.html',
			controller: 'practiseConfCtrl',
			resolve: {
				loggedin: checkLoggedIn
			}
		}).
		when('/practise/:id', {
			templateUrl: 'partials/practise.html',
			controller: 'practiseCtrl',
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

