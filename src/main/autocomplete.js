// Functions for handling command history and autocomplete
var Autocomplete,
    ipc = require("electron").ipcMain,
    fs = require('fs');

Autocomplete = (function() {
    var history, historyJSON,
        addHistory, query, getGhost, tabComplete,
        dateSortFun;

    // When the app loads, try to get the history JSON
    try {
        fs.accessSync("saved_data");
        fs.accessSync("saved_data/history.json");
    } catch(e) {
        fs.mkdirSync("saved_data");
        fs.writeFileSync("saved_data/history.json", "[]", {flag: "w+"});
    }
    historyJSON = fs.readFileSync("saved_data/history.json", {flag: "r+"}).toString().trim() || "[]";
    history = JSON.parse(historyJSON);

    // Function for sorting history entries by date
    dateSortFun = function(a,b) {
        return a.date - b.date;
    };

    // Add a command to the history, and save to disk
    addHistory = function(command) {
        // Create the entry
        var entry = {
            command: command,
            cwd: require("./commands.js").getCWD(),
            date: Date.now()
        }, duplicate = false, i;

        // Check for duplicates, update if found
        for(i = 0; i < history.length; i++) {
            if(history[i].command === command) {
                history[i].date = entry.date;
                history[i].cwd = entry.cwd;
                duplicate = true;
                break;
            }
        }

        // Add to the array if we didn't update
        if(duplicate === false) {
            history.push(entry);
        }

        // Only allow 2,000 entries
        while(history.length > 2000) {
            history.sort(dateSortFun);
            history = history.slice(1);
        }

        // Flush to disk
        historyJSON = JSON.stringify(history);
        fs.writeFile("saved_data/history.json", historyJSON);
    };

    // Query history/autocomplete based on a prefix
    query = function(prefix) {
        var bins = [[],[],[],[]], getBin,
            cwd = require("./commands.js").getCWD();

        getBin = function(entry) {
            if(prefix !== "" && entry.command.indexOf(prefix) === 0) {
                if(entry.cwd === cwd) {
                    return 0;
                } else {
                    return 1;
                }
            } else {
                if(entry.cwd === cwd) {
                    return 2;
                } else {
                    return 3;
                }
            }
        };

        // For each history member, send to correct bin
        history.map(function(entry) {
            var bin = getBin(entry);

            bins[bin].push({
                command: entry.command,
                date: entry.date,
                bin: bin
            });
        });

        // Sort each bin
        bins.map(function(bin) {
            bin.sort(dateSortFun);
        });

        // Append them all together
        return bins[0].concat(bins[1]).concat(bins[2]).concat(bins[3]);
    };

    // Handles tab completion on a prefix accordingly
    tabComplete = function(prefix) {

    };

    // Return out the interface
    return {
        addHistory: addHistory,
        query: query,
        tabComplete: tabComplete
    };
})();

// Handle incoming queries
ipc.on("query-autocomplete", function(event, args) {
    event.sender.send("autocomplete-result", Autocomplete.query(args.prefix));
});

module.exports = Autocomplete;
