var ngModule = require("../ngModule"),
    packageJSON = require("../../package.json"),
    ipc = require("electron").ipcRenderer;

ngModule.directive("appheader", function() {
    return {
        restrict: "E",
        replace: true,
        scope: {},
        templateUrl: "partials/header.html",
        link: function($scope, element, attrs) {
            $scope.packageJSON = packageJSON;
            $scope.cwd = process.env.HOME;
            $scope.showLogoFlyout = false;
            $scope.showSettingsFlyout = false;

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

            // Show the logo flyout
            $scope.toggleLogoFlyout = function() {
                $scope.showLogoFlyout = true;
            };

            // Show the settings flyout
            $scope.toggleSettingsFlyout = function() {
                $scope.showSettingsFlyout = true;
            };
        }
    };
});
