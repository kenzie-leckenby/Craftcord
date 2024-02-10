const fs = require('fs');

function timestamp() {
    const date = new Date();
    return `${(date.getMonth()+1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getMilliseconds().toString().substring(0, 2).padStart(2, '0')}`;
}

/**
 * @param {String} source either mc(minecraft), dc(discord), co(console), or er(error)
 * @param {String} author any string, Error, or Console
 * @param {String} messageBody any string
 */
function write(source, author, messageBody) {
    const logLine = `${timestamp()} ${source} (${author}) "${messageBody}"\n`;
    fs.writeFile('src/logs/log.txt', logLine, { flag: 'a'}, (err) => {
    });
}

/**
 * Sends a closing message to the log file
 */
function close() {
    const logLine = `${timestamp()} co (Console) "Bot Shutting Down"\n`;
    fs.writeFile('src/logs/log.txt', logLine, { flag: 'a'}, (err) => {
    });
}

module.exports = {
    write,
    close,
}