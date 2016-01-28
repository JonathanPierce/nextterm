var ngModule = require("../ngModule"),
    commands = require("../commands");

ngModule.controller("Wrapper", ["$scope", function($scope) {
    $scope.commands = [];

    // Runs a new command and adds it to the list
    $scope.runCommand = function(command) {
        // Create the command
        var newCommand = commands.runCommand(command);

        // Add to the array
        $scope.commands.push(newCommand);
    };

    // Removes a command from the list
    $scope.close = function(command) {
        var pos = $scope.commands.indexOf(command);
        if(pos !== -1) {
            $scope.commands.splice(pos, 1);
        }
    }
}]);
