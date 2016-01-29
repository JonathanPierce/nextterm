var ngModule = require("../ngModule"),
    termjs = require('term.js');

ngModule.directive("appconsole", function() {
    return {
        restrict: "E",
        templateUrl: "partials/console.html",
        scope: {
            command: "=command",
            wrapper: "=wrapper"
        },
        replace: true,
        link: function($scope, element, attrs) {
            var term;

            $scope.hasOutput = false;

            $scope.indicatorClass = "icon-running";

            // Create and mount the terminal
            term = new termjs.Terminal({
                rows: 15,
                cols: 80,
                screenKeys: true
            });

            term.open(element[0].querySelector(".term"));
            term.reset(); // Get rid of cursor

            // Handle text input
            term.on('data', function(text) {
                $scope.command.write(text);
            });

            // Register command event listeners
            $scope.command.register({
                data: function(text) {
                    term.write(text);

                    // We have output, show the terminal
                    $scope.$apply(function() {
                        $scope.hasOutput = true;
                    });
                },
                close: function(code) {
                    // get rid of the cursor
                    term.cursorEnabled = false;
                    term.cursorHidden = true;

                    // resize the terminal
                    if(term.y <= 15) {
                        term.resize(term.cols, term.y);
                    }

                    $scope.$apply(function() {
                        // Set the indicator
                        if(code === 0) {
                            $scope.indicatorClass = "icon-success";
                        } else {
                            $scope.indicatorClass = "icon-error";
                        }
                    });
                }
            });

            // Close this command
            $scope.close = function() {
                // If the program is complete, simply remove
                if($scope.command.isClosed() === true) {
                    $scope.wrapper.close($scope.command);
                    return;
                }

                // Otherwise, ask for confirmation
                var result = window.confirm(
                    "This program is still running. If you close it, unsaved data may be lost. Are you sure you want to close it?",
                    "Close Running Program?"
                );
                if(result === true) {
                    $scope.wrapper.close($scope.command);
                    $scope.command.kill();
                }
            };

            // For debugging...
            window._term = term;
        }
    };
});
