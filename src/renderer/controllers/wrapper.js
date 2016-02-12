var ngModule = require("../ngModule"),
    commands = require("../commands");

ngModule.controller("Wrapper", ["$scope", function($scope) {
    var canExecute, resizeTimeout, resizeComplete, resetClear,
        scrollGuardTimeout = null, scrollGuardHandler;

    $scope.commands = [];
    $scope.cols = Math.floor((document.body.offsetWidth - 32) / 6.69); // Rough initial estimate
    $scope.scrollGuard = false;

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

        // Is this a "reset" or "clear"
        if(resetClear(command)) {
            return;
        }

        // Create the command
        var newCommand = commands.runCommand(command, {
            cols: $scope.cols
        });

        // Add to the array
        $scope.commands.push(newCommand);

        // Scroll to the buttom
        var consolesListElem = document.querySelector('.app-consoles');
        consolesListElem.scrollTop = consolesListElem.scrollHeight;
    };

    // Removes a command from the list
    $scope.close = function(command) {
        var pos = $scope.commands.indexOf(command);
        if(pos !== -1) {
            $scope.commands.splice(pos, 1);
        }

        // If nothing there, focus on command bar
        if(!$scope.commands.length) {
            $scope.focusCommandBar();
        }
    };

    // Focuses on the command bar
    $scope.focusCommandBar = function() {
        window.setTimeout(function() {
            document.querySelector(".command-input").focus();
        }, 100); // Delay b/c terminals can steal focus
    };
    $scope.focusCommandBar(); // Focus on launch!

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

    // Handle resizing the window properly
    resizeComplete = function() {
        // Reset the resize timeout
        resizeTimeout = null;

        // Calculate the possible number of columns
        var sampleElem = document.querySelector(".app-console-wrapper .terminal"), cols;

        if(sampleElem) {
            cols = Math.max(20, Math.floor(sampleElem.offsetWidth / 6.69));

            if(cols !== $scope.cols) {
                $scope.cols = cols;

                // Resize the width of each one
                $scope.commands.map(function(command) {
                    command.resize({
                        cols: $scope.cols
                    });
                });
            }
        }
    };

    resizeTimeout = null;
    window.addEventListener("resize", function() {
        if(resizeComplete !== null) {
            window.clearTimeout(resizeTimeout);
        }

        resizeTimeout = window.setTimeout(resizeComplete, 300);
    });

    // Handle "reset" or "clear" commands
    resetClear = function(command) {
        var lowercase = command.toLowerCase().trim(), result;

        if(lowercase === "reset" || lowercase === "clear") {
            $scope.commands = $scope.commands.filter(function(entry) {
                return !entry.isClosed();
            });

            return true;
        }

        // Not a reset or clear
        return false;
    };

    // Make scrolling nicer
    document.querySelector('.app-consoles').addEventListener("scroll", function() {
        if(scrollGuardTimeout === null) {
            // Enable things
            $scope.$apply(function() {
                $scope.scrollGuard = true;
            });
            scrollGuardTimeout = window.setTimeout(scrollGuardHandler, 250);
        } else {
            // Continue things
            window.clearTimeout(scrollGuardTimeout);
            scrollGuardTimeout = window.setTimeout(scrollGuardHandler, 250);
        }
    });

    scrollGuardHandler = function() {
        $scope.$apply(function() {
            $scope.scrollGuard = false;
            scrollGuardTimeout = null;
        });
    };
}]);
