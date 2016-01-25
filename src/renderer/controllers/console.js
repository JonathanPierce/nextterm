var ngModule = require("../ngModule"),
    termjs = require('term.js');

ngModule.directive("appConsole", function() {
    console.log("Ran console.");

    return {
        restrict: "E",
        templateUrl: "partials/console.html",
        scope: {
            command: "=command"
        },
        replace: true,
        link: function($scope, element, attrs) {
            var term;

            // Create and mount the terminal
            term = new termjs.Terminal({
                rows: 10,
                cols: 70,
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
                },
                close: function(code) {
                    term.cursorEnabled = false;
                    term.cursorHidden = true;
                }
            });

            // For debugging...
            window.term = term;
        }
    };
});
