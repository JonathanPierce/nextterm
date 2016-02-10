var ngModule = require("../ngModule"),
    ipc = require("electron").ipcRenderer;

ngModule.directive("appflyout", function() {
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            "displayIf": "=displayIf"
        },
        templateUrl: "partials/flyout.html",
        link: function($scope, element, attrs) {
            var dirs = ["left", "right", "top", "bottom"], i, clickEater,
                isListening = false, startListening, stopListening;

            // Set the correct position
            for(i = 0; i < dirs.length; i++) {
                if(attrs[dirs[i]]) {
                    element[0].style[dirs[i]] = attrs[dirs[i]] + "px";
                }
            }

            // Attach to document.body
            element[0].parentNode.removeChild(element[0]);
            document.body.appendChild(element[0]);

            // Listen for external clicks (using a click-eater)
            clickEater = document.createElement("DIV");
            clickEater.classList.add("click-eater");
            clickEater.setAttribute("title", "click to close flyout");
            clickEater.addEventListener("click", function() {
                $scope.$apply(function() {
                    $scope.displayIf = false;
                });
            });

            // Show and hide as appropriate
            $scope.$watch("displayIf", function(newValue) {
                if(newValue) {
                    startListening();
                } else {
                    stopListening();
                }
            });

            startListening = function() {
                if(isListening === false) {
                    document.body.appendChild(clickEater);
                    isListening = true;
                }
            }

            stopListening = function() {
                if(isListening === true) {
                    document.body.removeChild(clickEater);
                    isListening = false;
                }
            }

            // Clean up on destroy
            $scope.$on("$destroy", function() {
                // remove event listeners
                stopListening();
            });
        }
    };
});
