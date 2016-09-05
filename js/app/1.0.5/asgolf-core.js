(function() {
    'use strict';

    angular.module('ASGolf.Core', ['ngResource', 'ui.bootstrap']) //
    .service('InitService', InitService) //
    .service('AnnouncementsService', AnnouncementsService) //
    .service('MinutesService', MinutesService) //
    .service('OfficersService', OfficersService) //
    .service('CourseService', CourseService) //
    .service('PlayersService', PlayersService) //
    .service('StatsService', StatsService) //
    .service('TournamentsService', TournamentsService) //
    .service('FunniesService', FunniesService) //
    .service('PhotosService', PhotosService) //
    .service('ScheduleService', ScheduleService) //
    .controller('PageMenuController', PageMenuController) //
    .controller('SeasonSelectController', SeasonSelectController) //
    .controller('SubHeaderController', SubHeaderController) //
    .controller('HeaderCtrl', HeaderCtrl) //
    .run(['$anchorScroll', function($anchorScroll) {
        $anchorScroll.yOffset = 60; 
    }]) //
    .component('pageMenu', {
        templateUrl: 'partials/pageMenu.html',
        controller: 'PageMenuController',
        bindings: {
            menuTitle: '@',
            menuScroll: '<',
            menuTargets: '<',
            menuSelect: '&'
        }
    })
    .component('seasonSelect', {
        templateUrl: 'partials/seasonSelect.html',
        controller: 'SeasonSelectController',
        bindings: {
        	season: '=',
        	onChange: '&'
        }
    })
    .component('subHeader', {
        templateUrl: 'partials/subHeader.html',
        controller: 'SubHeaderController',
        bindings: {
        	title: '='
        }
    });

    function SubHeaderController() {
        var vm = this;
    	vm.title;
    	
    	vm.scrollToTop = function() {
    	}
    }
    
    function SeasonSelectController(InitService) {
        var vm = this;
    	
    	vm.seasons = InitService.getInitData().seasons;
    	vm.season;
        
        vm.changeSeason = function() {
        	vm.onChange({season: vm.season});
        }
    }

	function PageMenuController($anchorScroll) {
        var vm = this;
        vm.menuTargets = {};
        vm.menuTitle = "Menu Title";
        vm.menuScroll = false;
        
        vm.scrollTo = function(item) {
            console.log("scroll to " + item);
			$anchorScroll(item);
        };
       
        vm.onSelect = function(item) {
        	if (vm.menuScroll) {
        		vm.scrollTo(item);
        	} else { 
        		vm.menuSelect({item: item});
        	}
        }
    }

    function InitService($resource) {
        var vm = this;

        vm.initData = null;

        $resource('../asgolf-assets/data/ini.js').get(function(resp) {
            vm.initData = angular.copy(resp);
            vm.initData.seasons = [];
            for (var i = resp.currentSeason; i >= 1996; i--) {
                vm.initData.seasons.push(i);
            };
        });

        return {
            constants: 'constants',
            getInitData: function() {
                return vm.initData;
            },
            getSeasons: function() {
                return vm.initData.seasons;
            }
        }
    }

    function AnnouncementsService($resource) {
        return $resource('../asgolf-assets/data/Announcements.xml', {}, {
            query: {
                method: 'GET',
                params: {
                    date: new Date()
                },
                isArray: false,
                transformResponse: function(data, headersGetter) {
                    var x2js = new X2JS();
                    var jObjs = x2js.xml_str2json(data);
                    return jObjs.Announcements;
                }
            }
        });
    }
     
    function PhotosService($resource) {
        var _s = this;
        _s.query = function(callback) {
            $resource('../asgolf-assets/data/photos.js').query(callback);
        }
    }
    
    function FunniesService($resource) {
        return $resource('../asgolf-assets/data/funnies.js');
    }
    
    function ScheduleService($resource) {
        var vm = this;
        vm.resource = $resource('../asgolf-assets/data/:year/events.xml', {}, {
            query: {
                method: 'GET',
                params: {
                    date: new Date()
                },
                isArray: false,
                transformResponse: function(data, headersGetter) {
                    var x2js = new X2JS();
                    var jObjs = x2js.xml_str2json(data);
                    return jObjs.Events;
                }
            }
        });

        vm.query = function(year, callback) {
            return vm.resource.query({
                year: year
            }, callback);
        }
    }
    
    function MinutesService($resource) {
        return $resource('../asgolf-assets/data/Minutes.xml', {}, {
            query: {
                method: 'GET',
                params: {},
                isArray: false,
                transformResponse: function(data, headersGetter) {
                    var x2js = new X2JS({
                        arrayAccessFormPaths: ["MinutesAndInformation.Minutes", "MinutesAndInformation.Minutes.item"]
                    });
                    var jObjs = x2js.xml_str2json(data);
                    return jObjs.MinutesAndInformation;
                }
            }
        });
    }

    function OfficersService($resource, $filter) {

        var _r = $resource('../asgolf-assets/data/officers.xml', {}, {
            query: {
                method: 'GET',
                params: {},
                isArray: false,
                transformResponse: function(data, headersGetter) {
                    var x2js = new X2JS({
                        arrayAccessFormPaths: ["Officers.Season"]
                    });
                    var jObjs = x2js.xml_str2json(data);
                    return jObjs.Officers;
                }
            }
        });

        this.getOfficers = function(callback) {
            _r.query(callback);
        };
    }
    
    function CourseService($resource) {
        var vm = this;
        vm.resource = $resource('../asgolf-assets/data/courses.js');

        vm.whiteSlope = function(course) {
            if (course != null) {
                for (var i = 0; i < course.tees.length; i++) {
                    var tee = course.tees[i];
                    if (tee.name == "white") {
                        return tee.slope;
                    }
                }
            }
            return 113;
        }

        vm.adjusted = function(slope, index) {
            var adj = slope == null ? 113 : slope;
            return index * adj / 113;
        }

        vm.query = function(callback) {
            return vm.resource.query(callback);
        }
    }

    function PlayersService($resource) {
        var vm = this;

        vm.get = function(playerId) {
           return $resource('../asgolf-assets/data/players/:playerId.js').get({
                playerId: playerId
            });
        };

        vm.query = function() {
            return $resource('../asgolf-assets/data/players.js').query();
        };
    }

    function StatsService($resource) {
        var serv = this;
        serv.statsResource = $resource('../asgolf-assets/data/:year/stats.js');
        serv.recordResource = $resource('../asgolf-assets/data/records.js');

        serv.getStats = function(year, callback) {
            serv.statsResource.get({
                year: year
            }, callback);
        }

        serv.getRecords = function(callback) {
            return serv.recordResource.get(callback);
        }
    }

    function TournamentsService($resource) {
        var serv = this;

        serv.resource = $resource('../asgolf-assets/data/:year/:id.js');

        serv.getTournament = function(year, id, callback) {
            serv.resource.get({
                year: year,
                id: id
            }, callback);
        };
        serv.getTournaments = function(year, callback) {
            serv.resource.query({
                year: year,
                id: 'tournaments'
            }, callback);
        };
        serv.getTwoDay = function(year, callback) {
            serv.resource.get({
                year: year,
                id: 'twoday'
            }, callback);
        };
    }

    function HeaderCtrl($location) {
    	var vm = this;
    	vm.collapse = true;
    	
        vm.isActive = function(viewLocations) {
            for (var i = 0; i < viewLocations.length; i++) {
                var aLoc = viewLocations[i];
                if (aLoc === $location.path()) {
                    return true;
                }
            }
            return false;
        }
        
        vm.goToPage = function(page) {
        	$location.path(page);
        	vm.collapse = true;
        }
    }


})();
