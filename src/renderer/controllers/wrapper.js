var ngModule = require("../ngModule"),
    commands = require("../commands");

ngModule.controller("Wrapper", ["$scope", function($scope) {
    var canExecute;

    $scope.commands = [];

    // Can we execute a command?
    canExecute = function() {
        var closedCommand = null, i;

        // Can have up to 40 entries
        if($scope.commands.length < 40) {
            return true;
        }

        // Remove the first closed command
        for(i = 0; i < $scope.commands.length; i++) {
            if($scope.commands[i].isClosed()) {
                closedCommand = $scope.commands[i];
                break;
            }
        }

        // If none, return false
        if(closedCommand !== null) {
            $scope.close(closedCommand);
            return true;
        } else {
            return false;
        }
    };

    // Runs a new command and adds it to the list
    $scope.runCommand = function(command) {
        // Make sure we have space for this command
        if(!canExecute()) {
            return window.alert(
                "In order to start another program, you first need to close one the programs that is already running.",
                "Too many programs!"
            );
        }

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

    // Handle closing the window properly
    window.onbeforeunload = function(e) {
        var hasRunningProgram = false, confirmResult;

        $scope.commands.map(function(command) {
            if(command.isClosed() === false) {
                hasRunningProgram = true;
            }
        });

        if(hasRunningProgram) {
            confirmResult = window.confirm(
                "There are still programs running. Are you sure you want to close NextTerm? All running programs will be killed.",
                "Are you sure?"
            );

            if(confirmResult === true) {
                // Close all running programs
                $scope.commands.map(function(command) {
                    if(command.isClosed() === false) {
                        command.kill();
                    }
                });
            } else {
                return false; // Prevent the close
            }
        }
    };
}]);
