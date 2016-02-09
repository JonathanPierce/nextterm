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

            $scope.handleKeyDown = function($event) {
                // Hit enter
                if($event.keyCode === 13) {
                    $scope.runCommand();
                }
            };

            // Main function for running commands
            $scope.runCommand = function() {
                if($scope.command.length > 0) {
                    // Run the command
                    $scope.wrapper.runCommand($scope.command);

                    // Clear the input
                    $scope.command = "";
                }
            };

            // Query the autocomplete system
            $scope.queryAutocomplete = function() {
                ipc.send("query-autocomplete", {
                    prefix: $scope.command
                });
            };

            ipc.on("autocomplete-result", function(event, results) {
                $scope.suggestions = results;

                console.log("SUGGESTIONS FOR " + $scope.command + ":");
                console.log(results);
            });
        }
    };
});
