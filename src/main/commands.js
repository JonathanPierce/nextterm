var ipc = require("electron").ipcMain,
    pty = require("pty.js"),
    child_process = require("child_process"),
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
        cols: 80,
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
});

// Write the input to the correct terminal
ipc.on("write-terminal", function(event, args) {
    if(childMap[args.id]) {
        var child = childMap[args.id];

        child.write(args.text);
    }
});

// Change the working directory
ipc.on("change-cwd", function(event, args) {
    var command, output;

    // From the curring working dir, cd into the new dir, pwd
    command = "cd " + cwd + " && cd " + args.dir + " && pwd";
    output = child_process.spawnSync("bash", ["-c", command]);
    if(output.status === 0) {
        cwd = output.stdout.toString().trim();
    }

    // Inform of the change
    event.sender.send("cwd-changed", {
        dir: cwd
    });
});
