(function() {
    'use strict';

    angular.module('ASGolf.Photos', ['ngResource', 'ASGolf.Core']) //
    .controller('PhotosCtrl', PhotosCtrl);

    function PhotosCtrl(PhotosService) {
        var vm = this;

        vm.interval = 5000;
        vm.active = 0;
        vm.folders = [];
        vm.folderTargets = {};
        vm.currentFolder = {};

        vm.changeFolder = function(item) {
            console.log('change folder to ' + item);
            vm.currentFolder = vm.folders.filter(function(elem) {
                return elem.name == item;
            })[0];
        };

        vm.init = function() {
            vm.folders = PhotosService.query(function(data){
				vm.folders = data;
       			vm.currentFolder = vm.folders[0];

				vm.folderTargets = {};
				vm.folders.forEach(function(elem) {
					vm.folderTargets[elem.name] = elem.label;
				});
            });
        };

        vm.init();

    }

})();
