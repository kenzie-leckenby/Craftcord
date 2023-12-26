const fs = require('fs');
const readline = require('readline');

const consoleWindow = document.getElementById('console');

function writeToConsole(messageObj) {
    const date = messageObj.date.replaceAll('.', '/');
    let hour = parseInt(messageObj.time.substring(0, 2));
    const minutes = parseInt(messageObj.time.substring(3, 5));
    let timeID = 'AM';
    if (hour >= 12) {
        timeID = 'PM';
        hour = hour % 12;
    } else if(hour == 0) {
        hour = 12;
    }
    const timestamp = `${hour}:${minutes} ${timeID}`;
    consoleWindow.innerHTML += `<div><div class="message-info"><span class="text-margin ${messageObj.source}-author">${messageObj.author}</span><span class="text-margin timestamp">${date} ${timestamp}</span></div><p class="message-body">${messageObj.body}</p></div>`;
}

function messageDecompiler(lastLine) {
    const messageArray = lastLine.split(' ');
    let messageBody = [messageArray[4]];
    for (let i = 5; i < messageArray.length; i++) {
        messageBody.push(messageArray[i]);
    }
    messageBody = messageBody.join(' ');
    return {
        date: messageArray[0],
        time: messageArray[1],
        source: messageArray[2],
        author: messageArray[3].substring(1, messageArray[3].indexOf(')')),
        body: messageBody.substring(1, messageBody.lastIndexOf('"'))
    }
}

function startLogWatcher() {
    let lastLineCount = 0;
    let lastLine = '';

    const readLineBeforeLast = () => {
        const fileStream = fs.createReadStream('src/logs/log.txt');
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

            if (lastLine.indexOf('Bot Shutting Down') != -1) {
                return;
            }

            writeToConsole(messageDecompiler(lastLine));

            lastLineCount = lineCount;
        });
    }

    readLineBeforeLast();

    setInterval(() => {
        readLineBeforeLast();
    }, 100); // You can adjust the polling interval as needed
}
startLogWatcher();

/*
*/