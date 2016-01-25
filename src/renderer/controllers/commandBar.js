var ngModule = require("../ngModule");

ngModule.directive("appcommandbar", function() {
    console.log("Ran commandBar.");

    return {
        restrict: "E",
        replace: true,
        scope: {
            wrapper: "=wrapper"
        },
        templateUrl: "partials/commandBar.html",
        link: function($scope, element, attrs) {
            $scope.command = "";

            $scope.runCommand = function() {
                // Run the command
                $scope.wrapper.runCommand($scope.command);

                // Clear the input
                $scope.command = "";
            };
        }
    };
});
