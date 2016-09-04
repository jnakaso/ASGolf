(function() {
    'use strict';

    angular.module('ASGolf.Info', ['ASGolf.Core']) //
    .controller('InfoCtrl', InfoCtrl);

    //CONTROLLERS

    function InfoCtrl(OfficersService, MinutesService, InitService) {
        var vm = this;
        
        vm.season = InitService.getInitData().seasons[0];
        vm.minutes = MinutesService.query();
        vm.officers = {};

        vm.setOfficers = function(data) {
            var filtered = data.Season.filter(function(elem) {
                return elem._year == vm.season;
            });
            vm.officers = filtered[0];
        }

        OfficersService.getOfficers(vm.setOfficers);

        vm.changeSeason = function(season) {
        	vm.season = season;
            OfficersService.getOfficers(vm.setOfficers);
        }
    }

})();
