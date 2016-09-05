(function() {
    'use strict';

    angular.module('ASGolf.Stats', ['ui.bootstrap', 'ASGolf.Core']) //
    .controller('StatisticsCtrl', StatisticsCtrl) //
    .controller('WhereCtrl', WhereCtrl) //
    .controller('CourseHistoryCtrl', CourseHistoryCtrl);

    function StatisticsCtrl(InitService, StatsService) {
        var vm = this;

        vm.season = InitService.getInitData().seasons[0];
        vm.scrollTargets = {
            'standings': 'Standings',
            'vardon': 'Vardon',
            'sandBagger': 'Sandbagger',
            'mostImproved': 'Most Improved',
            'birdies': 'U.F.O.s',
            'goodBadUgly': 'Good, Bad, and The Ugly',
            'threePutt': 'Three Putt',
            'drJekyll': 'Dr. Jekyll and Mr. Hyde',
            'holesInOne': 'Holes In One',
            'moneyPlayer': 'Money Player',
            'whereWePlayed': 'Where We\'ve Played'
        }
        vm.stats = {};
        vm.records = {};

        vm.changeSeason = function(season) {
       		vm.season = season;
			StatsService.getStats(vm.season, vm.refreshStats);
        };

        vm.refreshStats = function(data) {
            vm.stats = data;
        };

        vm.refreshRecords = function(data) {
            vm.records = data;
        };

        vm.moneyActiveOnly = true;
        vm.moneyActiveOnlyFilter = function(item) {
            return vm.moneyActiveOnly ? ("true" == item.active) : true;
        }

        StatsService.getStats(vm.season, vm.refreshStats);
        StatsService.getRecords(vm.refreshRecords);

    }

	function CourseHistoryCtrl($uibModalInstance, course, coursesList, where) {
		var vm = this;
        vm.course = course;
		vm.coursesList = coursesList;
		vm.where = where;
      
        vm.courseTournaments = function() {
            return vm.where.filter(function(item) {
                return item.course == vm.course;
            })
        };
        
        vm.prevCourse = function() {
            var index = vm.coursesList.indexOf(vm.course);
            var prevIndex = Math.max(index - 1, 0);
            vm.course = vm.coursesList[prevIndex];
        };

        vm.nextCourse = function() {
            var index = vm.coursesList.indexOf(vm.course);
            var nextIndex = Math.min(index + 1, vm.coursesList.length - 1);
            vm.course = vm.coursesList[nextIndex];
        };
                
        vm.close = function () {
    		$uibModalInstance.close();
 		};

	}

    function WhereCtrl($uibModal, $log, StatsService, InitService) {
    	var vm = this;
    	vm.title= "Where We've Played";
        vm.course;
        vm.seasons = InitService.getInitData().seasons;
        vm.where = [];
       	vm.coursesList = [];
       
        vm.change = function(course) {
        	vm.course = course;
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/courseHistoryModal.html',
                controller: 'CourseHistoryCtrl',
                controllerAs: 'wctrl',
                resolve: {
                    course: function() {
                        return vm.course;
                    },
                    coursesList: function() {
                        return vm.coursesList;
                    },
                    where: function() {
                        return vm.where;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                //$scope.selected = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
     
        vm.courseCount = function(courseName) {
            var filtered = vm.where.filter(function(item) {
                return item.course == courseName;
            });
            return filtered.length;
        };

        vm.didPlay = function(courseName, season) {
            var filtered = vm.where.filter(function(item) {
                return item.course == courseName && item.date.indexOf('' + season) > 0;
            });
            return filtered.length > 0;
        };

        vm.tournamentId = function(courseName, season) {
            var filtered = vm.where.filter(function(item) {
                return item.course == courseName && item.date.indexOf('' + season) > 0;
            });
            return filtered.length > 0 ? filtered[0].tournamentId : 0;
        };

        vm.init = function() {
        	StatsService.getRecords(function(data) {
				vm.where = data.whereWePlayed;
				vm.coursesList = data.whereWePlayed.reduce(function(p, c) {
					if (p.indexOf(c.course) < 0) p.push(c.course);
					return p;
				}, []);
        	});
         }
        
        vm.init();
	}

})();
