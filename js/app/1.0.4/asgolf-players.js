(function() {
    'use strict';

    angular.module('ASGolf.Players', ['ui.bootstrap', 'ASGolf.Core']) //
    .filter('activeOnly', activeOnly) //
    .controller('PlayersCtrl', PlayersCtrl) //
    .controller('PlayerModalCtrl', PlayerModalCtrl);

    function activeOnly() {
        return function(player, activeOnly) {
            return activeOnly ? (true == player.active) : true;
        }
    };
	
	function PlayerModalCtrl($uibModalInstance, PlayersService, player, players) {
		var vm = this;
		vm.players = players;
		vm.player = player;
	    vm.playerWithRounds = PlayersService.get(vm.player.id);
   
		vm.prevPlayer = function() {
            var playerIndex = players.indexOf(vm.player);
            vm.player = players[Math.max(0, playerIndex - 1)];
            vm.playerWithRounds = PlayersService.get(vm.player.id);
        }

        vm.nextPlayer = function() {
            var playerIndex = players.indexOf(vm.player);
            vm.player = players[Math.min(vm.players.length - 1, playerIndex + 1)];
            vm.playerWithRounds = PlayersService.get(vm.player.id);
        }
        
        vm.close = function () {
    		$uibModalInstance.close();
 		};

    }

    function PlayersCtrl($filter, $uibModal, $log, PlayersService, CourseService) {
        var vm = this;

        vm.players = PlayersService.query();
        vm.courses = {};
        vm.slope = 113;
        vm.activeOnly = true;
        vm.predicate = 'name';
        vm.reverse = false;
        vm.player;
        vm.playerWithRounds = {};

        vm.adjusted = function(index) {
            return CourseService.adjusted(vm.slope, index);
        }

        vm.activeOnlyFilter = function(player) {
            return vm.activeOnly ? (true == player.active) : true;
        };

        vm.changePlayer = function(player) {
        	vm.player = player;
            vm.playerWithRounds = PlayersService.get(player.id);
     		var modalInstance = $uibModal.open({
                templateUrl: 'partials/playerModal.html',
                controller: 'PlayerModalCtrl',
                controllerAs: 'ctrl',
            	resolve: {
                    player: function() {
                        return vm.player;
                    },
                    players: function() {
                    	var filtered = vm.players.filter(vm.activeOnlyFilter);
           			 	filtered = $filter('orderBy')(filtered, vm.predicate, vm.reverse);
           				return filtered;
           			}
                }
            });

            modalInstance.result.then(function(selectedItem) {
              //  $scope.selected = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }



        vm.init = function() {
            CourseService.query(function(data) {
                var map = {};
                for (var i = 0; i < data.length; i++) {
                    var course = data[i];
                    map[course.name] = CourseService.whiteSlope(course);
                }
                vm.courses = map;
            });
        };

        vm.init();
    }

})();
