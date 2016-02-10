var ngModule = require("../ngModule"),
    ipc = require("electron").ipcRenderer;

ngModule.directive("appcommandbar", function() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            wrapper: "=wrapper"
        },
        templateUrl: "partials/commandBar.html",
        link: function($scope, element, attrs) {
            $scope.command = "";
            $scope.suggestions = [];
            $scope.suggestionIndex = -1;

            // Handle keyboard stuff
            $scope.handleKeyDown = function($event) {
                // Hit enter
                if($event.keyCode === 13) {
                    if($scope.suggestionIndex === -1) {
                        // Run the command from the box
                        $scope.runCommand();
                    } else {
                        // Run the command from the suggestion
                        $scope.runCommand($scope.suggestions[$scope.suggestionIndex].command);
                    }

                    return;
                }

                // Up
                if($event.keyCode === 38) {
                    $event.preventDefault();

                    if($scope.suggestionIndex === -1) {
                        $scope.suggestionIndex = 0;
                    } else {
                        $scope.suggestionIndex = Math.min($scope.suggestionIndex + 1, $scope.suggestions.length - 1);
                    }

                    return;
                }

                // Down
                if($event.keyCode === 40) {
                    $event.preventDefault();

                    if($scope.suggestionIndex <= 0) {
                        $scope.suggestionIndex = -1;
                    } else {
                        $scope.suggestionIndex = Math.max($scope.suggestionIndex - 1, 0);
                    }

                    return;
                }

                // Tab
                if($event.keyCode === 9) {
                    $event.preventDefault();

                    // If there is a suggestion selected, set the command and hide
                    if($scope.suggestionIndex !== -1) {
                        $scope.command = $scope.suggestions[$scope.suggestionIndex].command;
                        $scope.suggestionIndex = -1;
                        $scope.queryAutocomplete();
                    } else {
                        // Otherwise, filter selections to only prefix matches
                        $scope.suggestions = $scope.suggestions.filter(function(entry) {
                            return entry.bin < 2 || entry.bin === 5;
                        });

                        // Is there a single result?
                        var singleResult = null, binFive;
                        if($scope.suggestions.length === 1) {
                            singleResult = $scope.suggestions[0];
                        } else {
                            // We'll be satisfied with only one local file/folder result
                            binFive = $scope.suggestions.filter(function(entry) {
                                return entry.bin === 5;
                            });

                            if(binFive.length === 1) {
                                singleResult = binFive[0];
                            }
                        }

                        // If there is only one result, set it as the command
                        if(singleResult) {
                            $scope.command = singleResult.command;
                            $scope.queryAutocomplete();
                        } else {
                            // Otherwise, show these suggestions
                            if($scope.suggestions.length > 0) {
                                $scope.suggestionIndex = 0;
                            }
                        }
                    }

                    return;
                }

                // Some other key
                $scope.suggestionIndex = -1;
            };

            // Keep the selected autosuggest result scrolled into view
            $scope.$watch("suggestionIndex", function(newValue) {
                // Handle the scrolling
                if(newValue !== -1) {
                    window.setTimeout(function() {
                        // Hack to get the correct elem after render
                        var elem = document.querySelector(".app-autosuggest-suggestion.selected");
                        if(elem) {
                            elem.scrollIntoView(true);
                        }
                    }, 10);
                }
            });

            // Main function for running commands
            $scope.runCommand = function(command) {
                if($scope.command.length > 0 || command) {
                    // Run the command
                    $scope.wrapper.runCommand(command || $scope.command);

                    // Clear the input
                    $scope.command = "";
                    $scope.suggestionIndex = -1;
                }
            };

            // Query the autocomplete system
            $scope.queryAutocomplete = function() {
                ipc.send("query-autocomplete", {
                    prefix: $scope.command
                });
            };

            ipc.on("autocomplete-result", function(event, results) {
                $scope.$apply(function() {
                    // Save the new suggestions
                    $scope.suggestions = results;
                });
            });
        }
    };
});
