(function() {
    'use strict';

    angular.module('ASGolf.Tournaments', ['ASGolf.Core']) //
    .controller('TourCtrl', TourCtrl);

    function TourCtrl($anchorScroll, $routeParams, $timeout, InitService, TournamentsService, StatsService) {
        var vm = this;

		vm.season = $routeParams.season;
		if (vm.season == undefined) {
			vm.season = InitService.getInitData().seasons[0];
		} else {
			vm.season = parseInt(vm.season); 
		}
        vm.scrollTargets = {
            'summary': 'Season Summary',
            'twoDay': 'Two-Day Tournament Results',
        };
        vm.tournaments = [];
        vm.stats = {};
        vm.twoday = {};
        vm.fullTournaments = [];
 
        vm.refreshTournaments = function(data) {
            vm.tournaments = data;

            vm.scrollTargets = {
                'summary': 'Season Summary',
                'twoDay': 'Two-Day Tournament Results',
            };
            
            vm.fullTournaments = [];
            data.forEach(function(t) {
                var hash = 'tour_' + t.id;
                vm.scrollTargets[hash] = t.courseName;
                TournamentsService.getTournament(vm.season, t.id, function(data) {
                    vm.fullTournaments.push(data);
                });
            });
        };

        vm.refreshTwoDay = function(data) {
            vm.twoday = data;
        };

        vm.refreshStats = function(data) {
            vm.stats = data;
        };

        vm.changeSeason = function(season) {
       		vm.season = season;
			TournamentsService.getTournaments(vm.season, vm.refreshTournaments);
            TournamentsService.getTwoDay(vm.season, vm.refreshTwoDay);
            StatsService.getStats(vm.season, vm.refreshStats);
        };

        vm.scrollToTournament = function(tourId) {
      		$anchorScroll('tour_' + tourId);
        };
        
        vm.init = function() {

        	TournamentsService.getTournaments(vm.season, vm.refreshTournaments);
			TournamentsService.getTwoDay(vm.season, vm.refreshTwoDay);
			StatsService.getStats(vm.season, vm.refreshStats);
			
			$timeout(function() {
					var tt = $routeParams.goToAnchor;
					vm.scrollToTournament(tt);
				},
				500
			) 
		};
		 
        vm.init();
       
    }

})();
