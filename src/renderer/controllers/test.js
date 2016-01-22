var ngModule = require("../ngModule"),
    commands = require("../commands");

ngModule.controller("Test", ["$scope", function($scope) {
    $scope.command = "";
    $scope.output = "";

    $scope.run = function() {
        commands.runCommand($scope.command, {
            onStdout: function(text) {
                $scope.$apply(function() {
                    $scope.output = text;
                });
            }
        });
    };
}]);
