var ngModule = require("../ngModule");

ngModule.directive("appheader", function() {
    return {
        restrict: "E",
        replace: true,
        scope: {},
        templateUrl: "partials/header.html",
        link: function($scope, element, attrs) {
            $scope.cwd = process.env.HOME;
        }
    };
});
