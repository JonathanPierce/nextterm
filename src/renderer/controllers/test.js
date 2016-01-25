var ngModule = require("../ngModule"),
    termjs = require('term.js'),
    commands = require("../commands");

ngModule.controller("Test", ["$scope", function($scope) {
    $scope.command = "";

    var term = new termjs.Terminal({
        rows: 24,
        cols: 80,
        screenKeys: true
    });
    window.term = term; // TEMP

    term.open(document.querySelector(".term"));

    term.on('data', function(text) {
        if(child) {
            child.write(text);
        }
    });

    var child = null;
    $scope.run = function() {
        term.reset();

        child = commands.runCommand($scope.command, {
            onData: function(text) {
                term.write(text);
            }
        });
    };
}]);
