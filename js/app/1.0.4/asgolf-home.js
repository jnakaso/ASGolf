(function() {
    'use strict';

    angular.module('ASGolf.Home', ['ngResource']) //
    .controller('LastTournamentCtrl', LastTournamentCtrl) //
    .controller('AnnouncementsCtrl', AnnouncementsCtrl) //
    .controller('TwoDayCtrl', TwoDayCtrl) //
    .controller('FunniesCtrl', FunniesCtrl) //
    .controller('MinutesCtrl', MinutesCtrl) //
    .controller('OnDeckMiniCtrl', OnDeckMiniCtrl);
    
     function OnDeckMiniCtrl(InitService, ScheduleService) {
	    var vm = this;
	    vm.event = {};
	    
	    vm.init = function() {
        	var initData = InitService.getInitData();
        	var season = initData.seasons[0];
			ScheduleService.query(season, function(data) {
            	vm.event = data.Event[initData.currentEvent - 1];
        	});
        }

        vm.init();
	}
	
    function TwoDayCtrl(InitService, TournamentsService) {
	    var vm = this;

		vm.initData = InitService.getInitData();
        vm.showTwoDay = vm.initData.showTwoDay;
        vm.twoDay = {};
        
	    vm.init = function() {
        	var season = vm.initData.seasons[0];
			TournamentsService.getTwoDay(season, function(data) {
            	vm.twoday = data;
        	});
        }
        
        vm.init();
    }
    
   function LastTournamentCtrl(InitService, TournamentsService) {
        var vm = this;
		vm.tournament = {};
		      
        vm.init = function() {
			var initData = InitService.getInitData();
        	
			vm.tournament = TournamentsService.getTournament(
				initData.lastTournamentSeason,
				initData.lastTournamentId,
				function(data) {
                    vm.tournament = data;
                }
			);
			
        }
            
        vm.init();
   }
    
     function AnnouncementsCtrl(AnnouncementsService) {
        var vm = this;
        
        vm.announcements = AnnouncementsService.query();
	}

   function MinutesCtrl(MinutesService) {
        var vm = this;
        
        vm.minutes = MinutesService.query();
	}


    function FunniesCtrl(FunniesService) {
        var vm = this;
        
        vm.rootDir = '../asgolf-assets/funnies/';
        vm.funnies = {};
        vm.funny;

        vm.changeFunny = function() {
			vm.funny = vm.rootDir + vm.funnies[Math.floor((Math.random() * vm.funnies.length))];
        	console.log("changeFunny " + vm.funny);
        }
        
        vm.init = function() {
            FunniesService.get(function(data) {
				vm.funnies = data.funnies;
				vm.funny = vm.rootDir + vm.funnies[Math.floor((Math.random() * data.funnies.length))];
			});
        }
        
        vm.init();
    };
    
})();