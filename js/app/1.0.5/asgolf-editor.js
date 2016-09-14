(function() {
    'use strict';

    angular.module('ASGolf.TournamentEditor', ['ngResource', 'ui.bootstrap']) //
    .service('TourService', tournamentEditorService) // 
    .controller('TourEditorCtrl', tourEditorCtrl) //
    .controller('KpEditorCtrl', kpEditorCtrl) //
    .controller('RoundEditorCtrl', roundEditorCtrl) //
    .controller('TourInfoEditorCtrl', tourInfoEditorCtrl) //
    .controller('ConfirmCtrl', confirmCtrl);

    function compareByTotal(aRound, bRound) {
        return (aRound.totalNet <= bRound.totalNet) ? -1 : 1;
    }

    function compareByFront(aRound, bRound) {
        return (aRound.frontNet <= bRound.frontNet) ? -1 : 1;
    }

    function compareByBack(aRound, bRound) {
        return (aRound.backNet <= bRound.backNet) ? -1 : 1;
    }

    function compact(orig) {
        var tempT = new Tournament();
        tempT.tournament = angular.copy(orig.tournament);
        orig.rounds.forEach(function(oRound) {
            var nRound = angular.copy(oRound);
            nRound.player = oRound.player.name;
            nRound.playerID = oRound.player.id;
            tempT.rounds.push(nRound);
        });
        orig.kps.forEach(function(oKp) {
            var nKp = angular.copy(oKp);
            nKp.player = oKp.player.id;
            tempT.kps.push(nKp);
        });

        return angular.toJson(tempT);
    };


    function tournamentEditorService($resource, $window, $filter, uibDateParser) {
        var myService = this;
        myService.flights= ['A', 'B'];
        
        myService.getTournament = function() {
            var tournament = angular.fromJson(sessionStorage.tournament);
            tournament = tournament ? tournament : new Tournament();
            var adate = uibDateParser.parse(tournament.tournament.date);
            tournament.tournament.date = tournament.tournament.date ? new Date(tournament.tournament.date) : null;
            return tournament;
        }

        myService.updateInfo = function(tournament, info) {
            tournament.tournament = info;
            myService.saveTournament(tournament);
        }

        myService.saveTournament = function(tournament) {
            sessionStorage.tournament = angular.toJson(tournament);
        }

        myService.sendTournament = function(tournament) {
            var info = escape('ASGolf : ' + tournament.tournament.courseName + ' : ' + $filter('date')(tournament.tournament.date, "yyyy-MM-dd"));
            var tour = compact(tournament);
            $window.location = 'mailto:jnakaso@yahoo.com?Subject=' + info + '&Body=' + tour;
        }

        myService.addKp = function(tournament, kp) {
            tournament.kps.push(kp);
            myService.saveTournament(tournament);
        }

        myService.removeKp = function(tournament, kp) {
            var index = tournament.kps.indexOf(kp);
            tournament.kps.splice(index, 1);
            myService.saveTournament(tournament);
        }

        myService.addRound = function(tournament, rounds) {
            tournament.rounds.push(rounds);
            myService.updateTotals(tournament);
        }

        myService.removeRound = function(tournament, round) {
            var index = tournament.rounds.indexOf(round);
            tournament.rounds.splice(index, 1);
            myService.updateTotals(tournament);
        }

        myService.updateTotals = function(tournament) {
            tournament.honeyPot = myService.createHoneyPot(tournament.rounds);
            tournament.winners = myService.createWinners(tournament.rounds);
            myService.saveTournament(tournament);
        };

        myService.compareByTotal = function(aRound, bRound) {
            return (aRound.totalNet <= bRound.totalNet) ? -1 : 1;
        };

        myService.compareByFront = function(aRound, bRound) {
            return (aRound.frontNet <= bRound.frontNet) ? -1 : 1;
        };

        myService.compareByBack = function(aRound, bRound) {
            return (aRound.backNet <= bRound.backNet) ? -1 : 1;
        };

        myService.findLowest = function(rounds) {
            var working = rounds.slice();
            working.sort(myService.compareByTotal);
            var lowest = new Array();
            var low = null;
            for (var i = 0; i < working.length; i++) {
                var round = working[i];
                var total = round.totalNet;
                if (low == null) {
                    low = total;
                } else if (low < total) {
                    break;
                }
                lowest.push(round);
            }
            return lowest;
        };


        myService.createPurse = function() {
            var purse = new Array();
            purse[0] = new JSPurse(9, 40);
            purse[1] = new JSPurse(6, 25);
            purse[2] = new JSPurse(3, 15);
            return purse;
        }

        myService.createWinners = function(rounds) {
            var winners = new Array();

            myService.flights.forEach(function(flt) {
                var purse = myService.createPurse();
                var working = rounds.filter(function(el) {
                    return el.flight == flt;
                });
                working.sort(myService.compareByTotal);

                var place = 1;
                while (purse.length > 0 && working.length > 0) {
                    var left = 0;
                    var money = 0;
                    var points = 0;
                    var winnerRounds = myService.findLowest(working);

                    left = Math.min(purse.length, winnerRounds.length);
                    for (var i = 0; i < left; i++) {
                        money += purse[i].earnings;
                        points += purse[i].points;
                    }
                    money = money / winnerRounds.length;
                    points = points / winnerRounds.length;

                    winnerRounds.forEach(function(round) {
                        var winner = new JSWinner(round, place, points, money);
                        winner.flight = flt;
                        winners.push(winner);
                    });
                    place += left;
                    purse = purse.slice(left);
                    working = working.slice(left);
                }
            });
            return winners;
        }

        myService.createHoneyPot = function(rounds) {
            var purse = 5 * rounds.length;
            var working = angular.copy(rounds);
            var overall = myService.findLowest(rounds);

            working = myService.removeAll(working, overall);
            working.sort(myService.compareByFront);

            var front = new Array();
            var low = null;
            for (var i = 0; i < working.length; i++) {
                var round = working[i];
                var total = round.frontNet;
                if (low == null) {
                    low = total;
                } else if (low < total) {
                    break;
                }
                front.push(round);
            }

            working = myService.removeAll(working, front);
            working.sort(myService.compareByBack);

            var back = new Array();
            var low = null;
            for (var i = 0; i < working.length; i++) {
                var round = working[i];
                var total = round.backNet;
                if (low == null) {
                    low = total;
                } else if (low < total) {
                    break;
                }
                back.push(round);
            }
            return new JSHoneyPot(purse, front, back, overall);
        }

        myService.removeAll = function(start, remove) {
            remove.forEach(function(round) {
                for (var i = 0; i < start.length; i++) {
                    if (round.player.id == start[i].player.id) {
                        start.splice(i, 1);
                        break;
                    }
                }
            });
            return start;
        }
    }

    function tourEditorCtrl($uibModal, TourService, CourseService, PlayersService) {
        var vm = this;
        vm.flights = TourService.flights;
        vm.tournament = TourService.getTournament();

        vm.saveTournament = function() {
            TourService.get().$promise.then(function(data) {
                vm.tournament = data;
            });
        };

        vm.sendTournament = function() {
            TourService.sendTournament(vm.tournament);
        };

        vm.newTournament = function() {
            var tourModalInstance = $uibModal.open({
                templateUrl: 'tourInfoModal.html',
                controller: 'TourInfoEditorCtrl',
                controllerAs: 'iCtrl',
                resolve: {
                    tourInfo: function() {
                        return new TournamentInfo();
                    },
                    courses: function() {
                        return CourseService.query();
                    },
                    mode: function() {
                        return "New ";
                    }
                }
            });

            tourModalInstance.result.then(function(info) {
                vm.tournament = new Tournament();
                TourService.updateInfo(vm.tournament, info);
            }, function() {
                console.log("Modal dismissed at: " + new Date());
            });
        };

        vm.editTournament = function() {
            var tourModalInstance = $uibModal.open({
                templateUrl: 'tourInfoModal.html',
                controller: 'TourInfoEditorCtrl',
                controllerAs: 'iCtrl',
                resolve: {
                    tourInfo: function() {
                        return angular.copy(vm.tournament.tournament);
                    },
                    courses: function() {
                        return CourseService.query();
                    },
                    mode: function() {
                        return "Edit ";
                    }
                }
            });

            tourModalInstance.result.then(function(info) {
                TourService.updateInfo(vm.tournament, info);
            }, function() {
                console.log('Modal dismissed at : ' + new Date());
            });
        };

        vm.newRound = function() {
            var roundModalInstance = $uibModal.open({
                templateUrl: 'roundModal.html',
                controller: 'RoundEditorCtrl',
                controllerAs: 'rCtrl',
                size: 'lg',
                resolve: {
                    tournament: function() {
                        return vm.tournament;
                    },
                    round: function() {
                        return new Round();
                    },
                    players: function() {
                        return PlayersService.query();
                    },
                    mode: function() {
                        return "New";
                    }
                }
            });

            roundModalInstance.result.then(function(round) {
                vm.tournament.rounds.push(round);
                TourService.updateTotals(vm.tournament);
            }, function() {
                console.log("Modal dismissed at: ", new Date());
            });
        };

        vm.editRound = function(selectedRound) {
            var roundModalInstance = $uibModal.open({
                templateUrl: 'roundModal.html',
                controller: 'RoundEditorCtrl',
                controllerAs: 'rCtrl',
                size: 'lg',
                resolve: {
                    tournament: function() {
                        return vm.tournament;
                    },
                    round: function() {
                        return angular.copy(selectedRound);
                    },
                    players: function() {
                        return PlayersService.query();
                    },
                    mode: function() {
                        return "Edit";
                    }
                }
            });

            roundModalInstance.result.then(function(round) {
                angular.copy(round, selectedRound);
                TourService.updateTotals(vm.tournament);
            }, function() {
                console.log("Modal dismissed at: " + new Date());
            });
        };

        vm.deleteRound = function(selectedRound) {
            var modalInstance = $uibModal.open({
                templateUrl: 'confirmModal.html',
                controller: 'ConfirmCtrl',
                controllerAs: 'cctrl',
                resolve: {
                    title: function() {
                        return "Confirm Delete";
                    },
                    msg: function() {
                        return "Delete " + selectedRound.player.firstName + "'s round?";
                    }
                }
            });

            modalInstance.result.then(function(status) {
                TourService.removeRound(vm.tournament, selectedRound);
                TourService.updateTotals(vm.tournament);
            }, function() {
                console.log("Modal dismissed at: ", new Date());
            });
        }


        vm.newKp = function() {
            var kpModalInstance = $uibModal.open({
                templateUrl: 'kpModal.html',
                controller: 'KpEditorCtrl',
                controllerAs: 'kctrl',
                resolve: {
                    players: function() {
                        return PlayersService.query();
                    },
                    kp: function() {
                        return new Kp();
                    },
                    mode: function() {
                        return "New";
                    }
                }
            });

            kpModalInstance.result.then(function(kp) {
                TourService.addKp(vm.tournament, kp);
            }, function() {
                console.log("Modal dismissed at: ", new Date());
            });
        };

        vm.editKp = function(selectedKp) {
            var kpModalInstance = $uibModal.open({
                templateUrl: 'kpModal.html',
                controller: 'KpEditorCtrl',
                controllerAs: 'kctrl',
                resolve: {
                    players: function() {
                        return PlayersService.query();
                    },
                    kp: function() {
                        return angular.copy(selectedKp);
                    },
                    mode: function() {
                        return "Edit";
                    }
                }
            });

            kpModalInstance.result.then(function(kp) {
                angular.copy(kp, selectedKp)
            }, function() {
                console.log("Modal dismissed at: ", new Date());
            });
        };

        vm.deleteKp = function(selectedKp) {
            var modalInstance = $uibModal.open({
                templateUrl: 'confirmModal.html',
                controller: 'ConfirmCtrl',
                controllerAs: 'cctrl',
                resolve: {
                    title: function() {
                        return "Confirm Delete";
                    },
                    msg: function() {
                        return "Delete " + selectedKp.player + "'s hard earned KP?";
                    }
                }
            });

            modalInstance.result.then(function(status) {
                TourService.removeKp(vm.tournament, selectedKp);
            }, function() {
                console.log("Modal dismissed at: ", new Date());
            });
        }

    }

    function confirmCtrl($uibModalInstance, title, msg) {
        var vm = this;
        vm.title = title;
        vm.msg = msg;

        vm.confirm = function() {
            $uibModalInstance.close("confirm");
        };

        vm.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };
    }

    function kpEditorCtrl($uibModalInstance, TourService, players, kp, mode) {
        var vm = this;
        vm.mode = mode;
        vm.kp = kp;
        vm.flights = TourService.flights;
        vm.players = players;
        vm.player;

        players.$promise.then(function(data) {
            vm.player = data.find(function(e) {
                return e.id == vm.kp.playerID
            });
        });

        vm.changePlayer = function() {
            vm.kp.playerID = vm.player.id;
            vm.kp.player = vm.player.firstName + ' ' + vm.player.lastName;
        }

        vm.save = function() {
            vm.kp.playerID = vm.player.id;
            vm.kp.player = vm.player.firstName + ' ' + vm.player.lastName;
            $uibModalInstance.close(vm.kp);
        };

        vm.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };
    }

    function roundEditorCtrl($uibModalInstance, TourService, CourseService, tournament, round, players, mode) {
        var vm = this;
        vm.tournament = tournament;
        vm.mode = mode;
        vm.flights = TourService.flights;
        vm.players = players;
        vm.round = round;
        vm.player;

        players.$promise.then(function(data) {
            vm.player = data.find(function(e) {
                return vm.round.player ? (e.id == vm.round.player.id) : false
            });
            vm.changePlayer();
        });

        vm.save = function() {
            vm.round.player = vm.player;
            $uibModalInstance.close(vm.round);
        };

        vm.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };

        vm.changePlayer = function() {
            vm.round.player = vm.player;
            vm.round.hdcp = vm.player ? Math.round(CourseService.adjusted(vm.tournament.tournament.slope, vm.player.handicap)) : 0;
            vm.totalHoles();
        };

        vm.updateRound = function() {
            vm.totalHoles();
        };

        vm.totalHoles = function() {
            var fr = 0;
            for (var i = 0; i < 9; i++) {
                fr += vm.round.holes[i];
            }
            var bk = 0;
            for (var i = 9; i < 18; i++) {
                bk += vm.round.holes[i];
            }
            vm.round.front = fr;
            vm.round.back = bk;
            vm.round.total = fr + bk;
            vm.round.frontNet = fr - (vm.round.hdcp / 2);
            vm.round.backNet = bk - (vm.round.hdcp / 2);
            vm.round.totalNet = vm.round.total - vm.round.hdcp;
        }
    }

    function tourInfoEditorCtrl($uibModalInstance, CourseService, tourInfo, courses, mode) {
        var vm = this;
        vm.courses = courses;
        vm.course = null;
        vm.tourInfo = tourInfo;

        courses.$promise.then(function(data) {
            for (var index = 0; index < data.length; ++index) {
                if (data[index].name == tourInfo.courseName) {
                    vm.course = data[index];
                    break;
                }
                vm.course = null;
            }
        });

        vm.changeCourse = function() {
            vm.tourInfo.rating = CourseService.whiteRating(vm.course);
            vm.tourInfo.slope = CourseService.whiteSlope(vm.course);
        }

        vm.save = function() {
            vm.tourInfo.courseName = vm.course.name;
            $uibModalInstance.close(vm.tourInfo);
        };

        vm.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };
    }

})();


function Kp() {
    this.playerID = null;
    this.player = null;
    this.hole = null;
    this.flight = null;
}

function Tournament() {
    this.tournament = new TournamentInfo();
    this.rounds = new Array();
    this.kps = new Array();
    this.winners = new Array();
}

function Round() {
    this.player;
    this.flight;
    this.holes = Array.apply(null, new Array(18)).map(Number.prototype.valueOf, 0);
    this.hdcp = 0;
    this.front = 0;
    this.back = 0;
    this.total = 0;
    this.frontNet = 0;
    this.backNet = 0;
    this.totalNet = 0;
}

function TournamentInfo() {
    this.courseName = "New Tournament";
    this.date = new Date();
    this.type = "NORMAL";
    this.rating = 70.0;
    this.slope = 113;
}

function JSHoneyPot(purse, front, back, overall) {
    this.purse = purse;
    this.front = front;
    this.back = back;
    this.overall = overall;
}

function JSPurse(points, earnings) {
    this.points = points;
    this.earnings = earnings;
}

function JSWinner(round, place, points, earnings) {
    this.round = round;
    this.place = place;
    this.points = points;
    this.earnings = earnings;
}
