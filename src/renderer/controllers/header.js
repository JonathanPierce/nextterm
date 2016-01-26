var ngModule = require("../ngModule"),
    ipc = require("electron").ipcRenderer;

ngModule.directive("appheader", function() {
    return {
        restrict: "E",
        replace: true,
        scope: {},
        templateUrl: "partials/header.html",
        link: function($scope, element, attrs) {
            $scope.cwd = process.env.HOME;

            // Change the visible working directory when it changes
            ipc.on("cwd-changed", function(event, args) {
                $scope.$apply(function() {
                    $scope.cwd = args.dir;
                });
            });

            // Open the visual working directory changer
            $scope.chooseGUI = function() {
                ipc.send("gui-change-cwd", {});
            };
        }
    };
});
