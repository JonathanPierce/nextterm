var ngModule = require("../ngModule");

ngModule.filter("suffix", function() {
    return function(input, prefix) {
        if(input.indexOf(prefix) === -1) {
            return input; // No match, return entire thing
        } else {
            return input.slice(prefix.length); // Return the remainder of the string
        }
    };
});
