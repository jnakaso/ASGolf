var ASGolf = angular.module('ASGolf', ['ngResource', 'ngRoute', 'ui.bootstrap']);

ASGolf.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/officers', {
        templateUrl: 'partials/officers.html'
      }).
      when('/minutes', {
        templateUrl: 'partials/minutes.html'
      }).
      when('/information', {
        templateUrl: 'partials/rules.html'
      }).
      when('/schedule', {
        templateUrl: 'partials/schedule.html'
      }).
      when('/tournaments', {
        templateUrl: 'partials/tournaments.html'
      }).
      when('/players', {
        templateUrl: 'partials/players.html'
      }).
      when('/statistics', {
        templateUrl: 'partials/statistics.html'
      }).
      when('/balance', {
        templateUrl: 'partials/balance.asp'
      }).
      when('/photos', {
        templateUrl: 'partials/photos.html'
      }).
      otherwise({
        templateUrl: 'partials/home.html'
      });
  }]);
 
ASGolf.factory('InitService', ['$resource',
	function($resource){
		return $resource('data/ini.js', {}, {
			query: {method:'GET', params:{}, isArray:false}
		}
	)}
]);

ASGolf.factory('InitValue',  ['InitService', function(InitService) {
	return InitService.query();
}]);

ASGolf.service('SeasonsService', ['$resource',
  function($resource){
  	var season = {year:2015};
  	var seasons = [];
  
	for (i = season.year; i>=1996;i--){
		seasons.push(i);
	};

	this.getSeason = function () {
		return season;
	};

	this.getSeasons = function () {
		return seasons;
	};
}]);

ASGolf.factory('ScheduleService', ['$resource',
	function($resource){
		return $resource('data/:year/events.xml', {}, {
			query: {method:'GET', 
				params:{},
				isArray:false,
				transformResponse: function(data, headersGetter) {
					var x2js = new X2JS();
					var jObjs = x2js.xml_str2json(data);
					return jObjs.Events;
				}
			}
	});
}]);

ASGolf.factory('AnnouncementService', ['$resource',
	function($resource){
		return $resource('data/Announcements.xml', {}, {
			query: {method:'GET', 
				params:{},
				isArray:false,
				transformResponse: function(data, headersGetter) {
					var x2js = new X2JS();
					var jObjs = x2js.xml_str2json(data);
					return jObjs.Announcements;
				}
			}
	});
}]);

ASGolf.factory('MinutesService', ['$resource',
	function($resource){
		return $resource('data/minutes.xml', {}, {
			query: {method:'GET', 
				params:{},
				isArray:false,
				transformResponse: function(data, headersGetter) {
					var x2js = new X2JS({
						arrayAccessFormPaths : [
						   "MinutesAndInformation.Minutes",
						   "MinutesAndInformation.Minutes.item"
						]
					});
					var jObjs = x2js.xml_str2json(data);
					return jObjs.MinutesAndInformation;
				}
			}
	});
}]);

ASGolf.factory('OfficersService', ['$resource',
	function($resource){
		return $resource('data/officers.xml', {}, {
			query: {method:'GET', 
				params:{},
				isArray:false,
				transformResponse: function(data, headersGetter) {
					var x2js = new X2JS({
						arrayAccessFormPaths : [
						   "Officers.Season"
						]
					});
					var jObjs = x2js.xml_str2json(data);
					return jObjs.Officers;
				}
			}
	});
}]);

ASGolf.factory('FunniesService', ['$resource',
	function($resource){
		return $resource('data/funnies.js', {}, {
			query: {method:'GET', params:{}, isArray:false},
	});
}]);

ASGolf.factory('TourService', ['$resource',
	function($resource){
		return $resource('data/:year/:id.js', {id:'tournaments'}, {
			query: {method:'GET', params:{}, isArray:true},
			get: {method:'GET', params:{}, isArray:false},
			twoday: {url:'data/:year/twoday.js', method:'GET', params:{}, isArray:false}
	});
}]);
     
ASGolf.factory('TwoDayService', ['$resource',
	function($resource){
		return $resource('data/:year/twoday.js', {}, {
			query: {method:'GET', params:{}, isArray:false}
	});
}]);

ASGolf.factory('StatsService', ['$resource',
  function($resource){
    return $resource('', {}, {
      get: {url:'data/:year/stats.js', method:'GET', params:{}, isArray:false}
    });
}]);

ASGolf.factory('RecordsServer', ['$resource',
  function($resource){
    return $resource('data/records.js', {}, {
      query: {method:'GET', params:{}, isArray:false}
    });
}]);

ASGolf.factory('PlayersService', ['$resource',
  function($resource){
    return $resource('', {}, {
      get: {
      	url:'data/players/:playerId.js',
      	method:'GET',
      	params:{},
        isArray:false},
	  query:{
	  	url:'data/players.js',
      	method:'GET',
      	params:{},
        isArray:true
	  }
    });
}]);

ASGolf.factory('CourseService', ['$resource',
  function($resource){
    return $resource('data/courses.js', {}, {
      query: {method:'GET', params:{}, isArray:true}
    });
}]);

ASGolf.factory('PhotosService', ['$resource',
	function($resource){
		return $resource('data/photos.js', {}, {
			query: {method:'GET', params:{}, isArray:true}
	});
}]);

function CourseAdjusted(slope, index) {
	var adj = slope == null ? 113 : slope;
	return index * adj / 113;
}

function WhiteSlope(course) {
	if (course != null){
		for (var i = 0; i < course.tees.length; i++) {
			var tee = course.tees[i];
			if (tee.name == "white") {
				return tee.slope;
			} 
		}
	}
	return 113;
}

ASGolf.directive('asScroll', ['$rootScope', '$location', '$routeParams', '$anchorScroll', function ($rootScope, $location, $routeParams, $anchorScroll){
		var newhash = $routeParams.goToAnchor;
		$location.hash('tour_' + newhash);
		$anchorScroll();
}]);
	
//CONTROLLERS
ASGolf.controller('SideBarCtrl', ['$scope', '$location', '$anchorScroll', function ($scope, $location, $anchorScroll){
	$scope.goToAnchor = function(newHash) {
		var old = $location.hash();
		$location.hash(newHash);
		$anchorScroll();
		//reset to old to keep any additional routing logic from kicking in
		$location.hash(old);
    };
    
    $scope.isActive = function(myHash) {
		return myHash === $location.hash();
	}
}]);


ASGolf.controller('HeaderCtrl', ['$scope', '$location', function ($scope, $location){
	$scope.isActive =function(viewLocations) {
		for (var i = 0; i < viewLocations.length; i++) {
			var aLoc = viewLocations[i];
			if (aLoc === $location.path()) {
				return true;
			} 
		}
		return false;
	}
}]);

ASGolf.controller('MinutesCtrl', ['$scope', 'MinutesService', function ($scope, MinutesService){
	$scope.minutes = MinutesService.query();
}]);

ASGolf.controller('AnnouncementsCtrl', ['$scope', 'AnnouncementService', function ($scope, AnnouncementService){
	$scope.announcements = AnnouncementService.query();
}]);

ASGolf.controller('LastTournamentCtrl', ['$scope', 'InitValue', 'TourService', function($scope, InitValue, TourService){
	InitValue.$promise.then(function (init) {
		$scope.tournament = TourService.get({year:init.lastTournamentSeason, id:init.lastTournamentId});
	});
}]);

ASGolf.controller('FunniesCtrl', ['$scope', 'FunniesService', function($scope, FunniesService){
	$scope.randomIndex = 0;
	
	FunniesService.query().$promise.then(function (data) {
		$scope.funnies = data.funnies;
		$scope.randomIndex = Math.floor((Math.random() * data.funnies.length));
	});
	
	$scope.changeFunny = function() {
		$scope.randomIndex = Math.floor((Math.random() * $scope.funnies.length));
	}
}]);

ASGolf.controller('PowerRankingsCtlr', ['$scope', 'InitValue', 'StatsService', function($scope, InitValue, StatsService) {
	InitValue.$promise.then(function (init) {
		$scope.stats = StatsService.get({year:init.powerRank});
	});
}]);

ASGolf.controller('ScheduleCtlr', ['$scope', '$filter', 'SeasonsService', 'InitValue', 'CourseService', 'ScheduleService', 'PlayersService',function($scope, $filter, SeasonsService, InitValue, CourseService, ScheduleService, PlayersService) {
	$scope.season = SeasonsService.getSeason();
	$scope.players = PlayersService.query();
	InitValue.$promise.then(function (init) {
		ScheduleService.query({year:init.currentSeason}).$promise.then(function (data) {
			var cIndex = init.currentEvent-1;
			$scope.event = data.Event[cIndex];
		});
		CourseService.query().$promise.then(function (data) {
			var course = $filter('filter')(data, {'id' : init.nextCourseId})[0];
			$scope.course = course;
			$scope.slope = WhiteSlope(course);
		});
	});
	
	$scope.adjusted = function(hdcpIndex) {
		return CourseAdjusted($scope.slope, hdcpIndex);
	};
	
	$scope.$watch('season.year', function (newValue, oldValue) {
		ScheduleService.query({year:$scope.season.year}).$promise.then(function (data) {
			$scope.events = data.Event;
		});
	});

}]);

ASGolf.controller('ToursCtlr', ['$scope', '$location', 'SeasonsService', 'TourService', function($scope, $location, SeasonsService, TourService) {
	$scope.season = SeasonsService.getSeason();
	$scope.$watch('season.year', function (newValue, oldValue) {
		$scope.tournaments = TourService.query({year:$scope.season.year});
	});
}]);

ASGolf.controller('TwoDayCtlr', ['$scope', 'SeasonsService', 'InitValue', 'TourService', function($scope, SeasonsService, InitValue, TourService) {
	$scope.season = SeasonsService.getSeason();
	InitValue.$promise.then(function (init) {
		$scope.showTwoDay = init.showTwoDay;
	});
	$scope.$watch('season.year', function (newValue, oldValue) {
		$scope.twoday = TourService.twoday({year:$scope.season.year});
	});
}]);
                                                                                                      
ASGolf.controller('TourCtlr', ['$scope', 'SeasonsService', 'TourService', function($scope, SeasonsService, TourService) {
	$scope.season = SeasonsService.getSeason();
	$scope.$watch('season.year', function (newValue, oldValue) {
		$scope.fullTournaments = [];
		TourService.query({year:$scope.season.year}).$promise.then(function (data) {
			for (var count in data) {
				var tourId = data[count].id;
				if (tourId != null) {
					TourService.get({year:$scope.season.year, id:tourId}).$promise.then(function(tData){
						$scope.fullTournaments.push(tData);
					});		
				}
			}
		});
	});	
}]);

ASGolf.controller('StandingsCtrl', ['$scope', 'SeasonsService', 'StatsService', 'PlayersService', 'TourService',function($scope, SeasonsService, StatsService, PlayersService, TourService) {
	$scope.season = SeasonsService.getSeason();
	$scope.player = null;
	$scope.$watch("season.year", function (newValue, oldValue) {
		$scope.stats = StatsService.get({year: $scope.season.year});
		$scope.tournaments = TourService.query({year:$scope.season.year});
	});
	$scope.changePlayer = function(inPlayer) {
		$scope.player = inPlayer;
		$scope.playerHist = PlayersService.get({playerId: inPlayer.playerId});
	};
}]);

ASGolf.controller('HdcpCtrl', ['$scope', 'PlayersService', 'CourseService', function($scope, PlayersService, CourseService) {
	$scope.players = PlayersService.query();
	$scope.slope = null;
	$scope.adjusted = function(index) {
		return CourseAdjusted($scope.slope, index);
	};
	
	CourseService.query().$promise.then(function (data){
		var map = {};
		for (var i = 0; i < data.length; i++) {
			var course = data[i];
			map[course.name] = WhiteSlope(course);
		}
		$scope.courses = map;
	});
	
}]);

ASGolf.controller('SeasonsCtrl', ['$scope', 'SeasonsService', 'InitValue', function($scope, SeasonsService, InitValue) {
	$scope.season = SeasonsService.getSeason();
	$scope.seasons = SeasonsService.getSeasons();
}]);

ASGolf.controller('StatsCtrl', ['$scope', 'SeasonsService', 'StatsService', function($scope, SeasonsService, StatsService) {
	$scope.season = SeasonsService.getSeason();
	$scope.$watch("season.year", function (newValue, oldValue) {
		$scope.stats = StatsService.get({year: $scope.season.year});
	});
}]);

ASGolf.controller('RecordsCtrl', ['$scope', 'RecordsServer', function($scope, RecordsServer) {
	$scope.stats = RecordsServer.query();
}]);

ASGolf.controller('MoneyCtrl', ['$scope', 'RecordsServer', function($scope, RecordsServer) {
	$scope.activeOnly = true;
	$scope.stats = RecordsServer.query();
	$scope.activeOnlyFilter = function (item) {
		if ($scope.activeOnly) {
			return "true" == item.active;
		}
		return true;
	}
}]);

ASGolf.controller('OfficersCtrl', ['$scope', '$filter', 'SeasonsService', 'OfficersService', function($scope, $filter, SeasonsService, OfficersService) {
	$scope.season = SeasonsService.getSeason();
	$scope.$watch("season.year", function (newValue, oldValue) {
		OfficersService.query().$promise.then(function (data) {
			$scope.officers = $filter('filter')(data.Season, {_year:$scope.season.year})[0];
		});
	});
}]);

ASGolf.controller('WhereCtrl', ['$scope',  'RecordsServer', function($scope, RecordsServer) {
	$scope.course;
	$scope.change = function(course) {
		$scope.course = course;
    };
    $scope.prevCourse = function() {
    	var index = $scope.coursesList.indexOf($scope.course);
		var prevIndex = Math.max(index-1, 0);
		$scope.course = $scope.coursesList[prevIndex];
    };
    $scope.nextCourse = function() {
    	var index = $scope.coursesList.indexOf($scope.course);
    	var nextIndex = Math.min(index+1, $scope.coursesList.length-1);
		$scope.course = $scope.coursesList[nextIndex];
    };
	RecordsServer.query().$promise.then(function (data){
		var map = {};
		var list = [];
		for (var count in data.whereWePlayed) {
			var cName = data.whereWePlayed[count].course;
			if (cName in map) {
				map[cName]++;
			} else {
				map[cName] = 1;
				list.push(cName);
			}
		}
		$scope.stats = data;
		$scope.courses = map;
		$scope.coursesList = list;
	});	
}]);

ASGolf.controller('PhotosCtrl', ['$scope','PhotosService', function ($scope, PhotosService) {
	$scope.myInterval = 5000;
	var slides = $scope.slides = [];
	
	PhotosService.query().$promise.then(function (data) {
		$scope.folders = data;
		$scope.currentFolder = data[0];
	});

	$scope.changeFolder = function(folder) {
		$scope.currentFolder = folder;
		$scope.photoIndex = 0;
	}

}]);

