const { latestLogFilePath } = require('../../config.json');
const { vanillaDeathMessages } = require('./knownDeathMessages.json');
const EventEmitter = require('events');
const fs = require('fs');  // Remove the destructuring
const readline = require('readline');  // Remove the destructuring

class LogReader extends EventEmitter {
    constructor() {
        super();
        this.startLogWatcher();
    }

    startLogWatcher() {
        let output = {};
        let lastLineCount = 0;
        let lastLine = '';

        const readLineBeforeLast = () => {
            const fileStream = fs.createReadStream(latestLogFilePath);
            const readLine = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });

            let lineCount = 0;

            // Checks how many lines the file is
            readLine.on('line', (line) => {
                lineCount++;
                lastLine = line;
            });

            readLine.on('close', () => {
                // If the line count hasn't changed do not send message
                if (lineCount === lastLineCount) {
                    return;
                }

                // Checks if the message contains a death message for a later else if statement
                let found = false;
                for (const element of vanillaDeathMessages) {
                    if (lastLine.indexOf(element) != -1) {
                        found = true;
                        break;
                    }
                }

                // Checks if it is a chat message
                if (lastLine.indexOf('<') != -1) {
                    const username = lastLine.substring(lastLine.indexOf('<') + 1, lastLine.indexOf('>'));
                    const message = lastLine.substring(lastLine.indexOf('>') + 1);
                    output = {
                        username: username,
                        message: message,
                        type: "chat"
                    };
                    this.emit('latestMessageChanged', output);  // Emit the event with the output
                }

                // Checks if it is a player join/leave message
                else if (lastLine.indexOf('joined') != -1) {  // Added 'left' check
                    const extractedData = lastLine.match(/\[.+?\] \[.+?\]: (.+?) (.+? .+)$/);
                    const username = extractedData[1];
                    const message = extractedData[2];
                    output = {
                        username: username,
                        message: message,
                        type: "playerJoin"
                    };
                    this.emit('latestMessageChanged', output);  // Emit the event with the output
                }
                else if (lastLine.indexOf('left') != -1) {
                    const extractedData = lastLine.match(/\[.+?\] \[.+?\]: (.+?) (.+? .+)$/);
                    const username = extractedData[1];
                    const message = extractedData[2];
                    output = {
                        username: username,
                        message: message,
                        type: "playerLeave"
                    };
                    this.emit('latestMessageChanged', output);  // Emit the event with the output
                }

                // Checks if it is a death message
                else if (found) {
                    const extractedData = lastLine.match(/\[.+?\] \[.+?\]: (.+?) (.+? .+)$/);
                    const username = extractedData[1];
                    const message = extractedData[2];
                    output = {
                        username: username,
                        message: message,
                        type: "death"
                    };
                    this.emit('latestMessageChanged', output);  // Emit the event with the output
                }

                // Checks if it is an advancement, challenge, or goal
                else if (lastLine.indexOf('advancement') != -1 || lastLine.indexOf('challenge') != -1 || lastLine.indexOf('goal') != -1) {
                    const extractedData = lastLine.match(/\[.+?\] \[.+?\]: (.+?) (.+? .+)$/);
                    const username = extractedData[1];
                    const message = extractedData[2];
                    const type = lastLine.indexOf('advancement') != -1 ? 'advancement' : (lastLine.indexOf('challenge') != -1 ? 'challenge' : 'goal');  // Fix the type condition
                    output = {
                        username: username,
                        message: message,
                        type: type
                    };
                    this.emit('latestMessageChanged', output);  // Emit the event with the output
                }

                lastLineCount = lineCount;
            });
        }

        readLineBeforeLast();

        setInterval(() => {
            readLineBeforeLast();
        }, 100); // You can adjust the polling interval as needed
    }
}

module.exports = {
    LogReader,
};
