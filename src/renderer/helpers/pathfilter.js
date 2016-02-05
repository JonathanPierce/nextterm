var ngModule = require("../ngModule");

ngModule.filter("path", function() {
    return function(input) {
        var parts, diff;

        // Remove the leading "/", then split on the rest
        parts = input.slice(1).split("/");

        // Are we in the home directory?
        if(parts[0] === "home" && parts.length >= 2) {
            parts[0] = "~";
            parts.splice(1,1); // knock off the username
        }

        // Are we too long
        if(parts.length >= 8) {
            diff = parts.length - 7;

            // Keep the last four for sure
            parts.splice(parts.length - 4 - diff, diff, "...");
        }

        // Put it back together
        return parts[0] === "~" ? parts.join("/") : "/" + parts.join("/");
    };
})
