var ngModule = require("../ngModule"),
    commands = require("../commands");

ngModule.controller("Wrapper", ["$scope", function($scope) {
    $scope.commands = [];

    $scope.runCommand = function(command) {
        // Create the command
        var newCommand = commands.runCommand(command);

        // Add to the array
        $scope.commands.push(newCommand);
    };
}]);
