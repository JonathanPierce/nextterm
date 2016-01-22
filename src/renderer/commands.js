// Handles communication with the main process
var ipc = require("electron").ipcRenderer,
    Command,
    listeners,
    idBase = 0;

listeners = (function() {
    var register, degregister, emit,
        registrations = {};

    ipc.on("new-stdout", function(event, args) {
        var id = args.id,
            text = args.text;

        emit("stdout", id, text);
    });

    ipc.on("new-stderr", function(event, args) {
        var id = args.id,
            text = args.text;

        emit("stderr", id, text);
    });

    ipc.on("process-close", function(event, args) {
        var id = args.id,
            code = args.code;

        emit("close", id, code);
    });

    // Start listening for events for this process
    register = function(id, stdout, stderr, close) {
        registrations[id] = {
            stdout: stdout,
            stderr: stderr,
            close: close
        };
    };

    deregister = function(id) {
        registrations[id] = null;
    };

    emit = function(event, id, args) {
        var registration;

        // Id the ID is still registered....
        if(registrations[id]) {
            registration = registrations[id];

            if(registration[event]) {
                // If this event is there, do it...
                registration[event](args);
            }
        }
    }

    // Return out the interface
    return {
        register: register,
        deregister: deregister
    };
})();

Command = function(command, options) {
    var id, output = [""],
        onStdout, onStderr, onClose;

    // generate a unique id
    id = idBase; idBase++;

    // Listeners
    onStdout = function(text) {
        var lines = text.split("\n");

        // Add the first line to the end of the last
        output[output.length - 1] += lines[0];

        // Add the other lines to the end
        output = output.concat(lines.slice(1));

        // Keep only the last 40 lines
        output = output.slice(-40);

        // Emit to outside listener
        options.onStdout && options.onStdout(getOutput());

        // TEMP
        console.log(getOutput());
    };

    onStderr = function(text) {
        // TEMP
        console.log("STDERR(" + id + "): " + text);

        // Emit to outside listener
        options.onStderr && options.onStderr(text);
    };

    onClose = function(code) {
        // Deregister any listeners
        listeners.deregister(id);

        // TEMP
        console.log("CLOSED " + id + " with code " + code);

        // Emit to outside listener
        options.onClose && options.onClose(code);
    };

    // Register listeners
    listeners.register(id, onStdout, onStderr, onClose);

    // Tell main to run the command
    ipc.send("run-command", {
        id: id,
        command: command
    });

    // Helper functions
    var getOutput = function() {
        return output.join("\n");
    };

    // Return out the interface
    return {
        id: id,
        getOutput: getOutput
    };
};

module.exports = {
    runCommand: function(command, options) {
        return Command(command, options);
    }
};
