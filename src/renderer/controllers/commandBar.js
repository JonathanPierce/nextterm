var ngModule = require("../ngModule");

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
        }
    };
});
