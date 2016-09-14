(function() {
    'use strict';

    angular.module('ASGolf.Schedule', ['ngResource', 'ui.bootstrap', 'ASGolf.Core']) //
    .controller('OnDeckCtrl', OnDeckCtrl) //
    .controller('ScheduleCtrl', ScheduleCtrl);

    function OnDeckCtrl(InitService, ScheduleService, PlayersService, CourseService) {
        var vm = this;

        vm.players = PlayersService.query();
        vm.course = {};

        // TODO make into filter
        vm.adjusted = function(hdcpIndex) {
            return CourseService.adjusted(vm.slope, hdcpIndex);
        };

        vm.init = function() {
            CourseService.query(function(data) {
                var initData = InitService.getInitData();
                vm.course = data.filter(function(elem) {
                    return elem.id == initData.nextCourseId;
                })[0];
                vm.slope = CourseService.whiteSlope(vm.course);
            });
        }

        vm.init();
    }

    function ScheduleCtrl(InitService, ScheduleService) {
        var vm = this;

        var initData = InitService.getInitData();
        vm.season = initData.seasons[0];

        vm.refresh = function(data) {
            vm.events = data.Event;
            vm.event = data.Event[initData.currentEvent - 1];
        };

        vm.changeSeason = function(season) {
            vm.season = season;
            ScheduleService.query(vm.season, vm.refresh);
        }

        vm.init = function() {
            ScheduleService.query(vm.season, vm.refresh);
        }

        vm.init();
    }

})();
