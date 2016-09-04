(function() {
    'use strict';

    angular.module('ASGolf', ['ngResource', 'ngRoute', 'ui.bootstrap' //
    , 'ASGolf.Home' //
    , 'ASGolf.Info' //
    , 'ASGolf.Photos' //
    , 'ASGolf.Schedule' //
    , 'ASGolf.Stats' //
    , 'ASGolf.Tournaments' //
    , 'ASGolf.Players']) //
    .config(routing);

    function routing($routeProvider) {
        $routeProvider.when('/balance', {
            templateUrl: 'partials/balance.asp',
        }).when('/information', {
            templateUrl: 'partials/information.html',
            resolve: {
                'constants': function(InitService) {
                    return InitService.constants;
                }
            }
        }).when('/tournaments', {
            templateUrl: 'partials/tournaments.html',
            resolve: {
                'constants': function(InitService) {
                    return InitService.constants;
                }
            }
        }).when('/statistics', {
            templateUrl: 'partials/statistics.html',
            controller: 'StatisticsCtrl',
            controllerAs: 'ctrl',
            resolve: {
                'constants': function(InitService) {
                    return InitService.constants;
                }
            }
        }).when('/schedule', {
            templateUrl: 'partials/schedule.html',
            resolve: {
                'constants': function(InitService) {
                    return InitService.constants;
                }
            }
        }).when('/players', {
            templateUrl: 'partials/players.html',
            controller: 'PlayersCtrl',
            controllerAs: 'ctrl',
            resolve: {
                'constants': function(InitService) {
                    return InitService.constants;
                }
            }
        }).when('/photos', {
            templateUrl: 'partials/photos.html',
            controller: 'PhotosCtrl',
            controllerAs: 'pctrl'
        }).otherwise({
            templateUrl: 'partials/home.html',
            resolve: {
                'constants': function(InitService) {
                    return InitService.constants;
                }
            }
        });
    }

})();
