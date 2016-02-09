var ipc = require("electron").ipcMain,
    pty = require("pty.js"),
    child_process = require("child_process"),
    Autocomplete = require("./autocomplete.js"),
    dialog = require("electron").dialog,
    cwd = process.env.HOME,
    childMap = {};

// Run a command and print out standard output
ipc.on("run-command", function(event, args) {
    var command = args.command,
        onData, onClose,
        id = args.id;

    // Create the child process
    var child = pty.spawn("bash", ["-c", command], {
        name: 'xterm-color',
        cols: args.cols || 80,
        rows: 15,
        cwd: cwd,
        env: process.env
    });

    // Save the child
    childMap[id] = child;

    // Declare removable listeners
    onData = function(text) {
        event.sender.send("new-data", {
            id: id,
            text: text.toString()
        });
    };

    onClose = function(code, signal) {
        // Remove from child map
        childMap[id] = null;

        // Send the close
        event.sender.send("process-close", {
            id: id,
            code: code,
            signal: signal
        });
    };

    child.on("data", onData);
    child.on("exit", onClose);

    // Save to the command history
    Autocomplete.addHistory(command);
});

// Write the input to the correct terminal
ipc.on("write-terminal", function(event, args) {
    if(childMap[args.id]) {
        var child = childMap[args.id];

        child.write(args.text);
    }
});

// KIll a program
ipc.on("kill-program", function(event, args) {
    if(childMap[args.id]) {
        var child = childMap[args.id];

        child.destroy();
    }
});

// Resize a program
ipc.on("resize-program", function(event, args) {
    if(childMap[args.id]) {
        var child = childMap[args.id],
        rows = args.dims.rows || child.rows,
        cols = args.dims.cols || child.cols;

        child.resize(cols, rows);
    }
});

// Change the working directory
ipc.on("change-cwd", function(event, args) {
    var command, output;

    // From the curring working dir, cd into the new dir, pwd
    command = "cd " + args.dir + " && pwd";
    output = child_process.spawnSync("bash", ["-c", command], {cwd: cwd});
    if(output.status === 0) {
        cwd = output.stdout.toString().trim();

        // Inform of the change
        event.sender.send("cwd-changed", {
            dir: cwd
        });
    }
});

// GUI change the working directory
ipc.on("gui-change-cwd", function(event, args) {
    dialog.showOpenDialog({
        title: "Pick a Directory",
        defaultPath: cwd,
        properties: ["openDirectory", "createDirectory"]
    }, function(results) {
        // Change the directory
        if(results) {
            cwd = results[0];

            // Inform of the change
            event.sender.send("cwd-changed", {
                dir: cwd
            });
        }
    });
});

// Helper interface functions
module.exports = {
    getCWD: function() {
        return cwd;
    }
};
