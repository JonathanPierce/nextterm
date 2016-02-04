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
            var term, resizeStartY, resizeStartHeight, doResizing, endResizing, resizeAccDiff = 0;

            $scope.hasOutput = false;
            $scope.indicatorClass = "icon-running";

            // Create and mount the terminal
            term = new termjs.Terminal({
                rows: 15,
                cols: $scope.wrapper.cols,
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

                    // If we're the last command, focus on the command bar
                    if($scope.command === $scope.wrapper.commands.slice(-1)[0]) {
                        $scope.wrapper.focusCommandBar();
                    }

                    // Other UI stuff for Angular
                    $scope.$apply(function() {
                        // Set the indicator
                        if(code === 0) {
                            $scope.indicatorClass = "icon-success";
                        } else {
                            $scope.indicatorClass = "icon-error";
                        }
                    });
                },
                resize: function(dims) {
                    // Make the displayed terminal math the back end terminal size
                    var rows = dims.rows || term.rows, cols = dims.cols || term.cols;

                    term.resize(cols, rows);
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

            // Stuff for resizing
            $scope.startResizing = function(e) {
                resizeStartY = e.clientY;
                resizeStartHeight = element[0].querySelector(".term").offsetHeight;

                document.body.addEventListener("mousemove", doResizing);
                document.body.addEventListener("mouseup", endResizing);
                document.body.addEventListener("mouseleave", endResizing);
            };

            doResizing = function(e) {
                var diff = e.clientY - resizeStartY;
                if(diff > 0 && e.clientY >= document.body.offsetHeight - 45) {
                    // Help out near the bottom
                    resizeAccDiff += 5;
                    diff += resizeAccDiff;
                    element[0].querySelector(".app-console-footer").scrollIntoView(false);
                } else {
                    resizeAccDiff = 0;
                }
                element[0].querySelector(".term").style.height = Math.max(8, (resizeStartHeight + diff)) + "px";
                window.getSelection().removeAllRanges(); // Prevent weird selection crap

            };

            endResizing = function(e) {
                var height, rows;

                // Remove all listeners
                document.body.removeEventListener("mousemove", doResizing);
                document.body.removeEventListener("mouseup", endResizing);
                document.body.removeEventListener("mouseleave", endResizing);

                // Get the height, reset it
                height = element[0].querySelector(".term").offsetHeight;
                element[0].querySelector(".term").style.height = "auto";

                // Calculate the number of rows
                rows = Math.max(1, Math.ceil(height / 13.7));

                // Do the resize
                $scope.command.resize({rows: rows});
                element[0].scrollIntoView();
            };
        }
    };
});
