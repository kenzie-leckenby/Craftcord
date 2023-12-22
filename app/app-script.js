const consoleWindow = document.getElementById('console');

function timestampConverter(timestamp) {
    const currentHour = Number(timestamp.substring(0, timestamp.indexOf(':')));
    const currentMinute = Number(timestamp.substring(timestamp.indexOf(':'), timestamp.lastIndexOf(':')));
    if(currentHour > 12) {
        return `${currentHour%12}:${currentMinute} PM`;
    }else{
        return `${currentHour}:${currentMinute} AM`;
    }
}

/**
 * Writes a message to the console element of the index.html
 * @param {string} timestamp formatted as hours:minutes:seconds, example 23:26:42
 * @param {string} source either "mc" or "dc"
 * @param {string} author
 * @param {string} messageBody
 * @param {number} id
 */
function messageWriter(timestamp, source, author, messageBody, id) {
    let currentDate = new Date();
    currentDate = `${currentDate.getMonth()+1}/${currentDate.getDate}/${currentDate.getFullYear}`;

    const formattedMessage = `
        <div id="${id}">
            <div class="message-info">
                <span class="text-margin ${source}-author">${author}</span><span class="text-margin timestamp">${currentDate} ${timestampConverter(timestamp)}</span>
            </div>
            <p class="message-body">${messageBody}</p>
        </div>
    `;

    consoleWindow.innerHTML += formattedMessage;
}


