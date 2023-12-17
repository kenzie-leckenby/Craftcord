let Rcon  = require('rcon');

// Converts messages into the tellraw syntax Minecraft uses
function tellrawFormatter(messageBody, username = undefined) {
    if (username === undefined) {
        return `/tellraw @a ["", {"text":"[Discord]", "color":"blue"}, " ${messageBody}"]`;
    } else {
        return `/tellraw @a ["", {"text":"[Discord]", "color":"blue"}, " ${username}:" ," ${messageBody}"]`;
    }
}

// Connects the RCON with Minecraft server hosted on the local machine
class mcRCON {
    constructor(ip = 'localhost', rconPort = 25565, rconPassword = '') {
        this.conn = new Rcon(ip, rconPort, rconPassword);
        this.conn.on('auth', () => {
            console.log('RCON Connected')
        }).on('error', () => {
            console.log('RCON Unable to Connect, Check RCON port and IP');
        });

        this.conn.connect();
    }

    // Sends a message through the Minecraft console using RCON with tellraw formatting
    sendMessage(messageContent, author) {
        this.conn.send(tellrawFormatter(messageContent, author));
    }
}

// TODO: Add a filter for messages containing images or emotes

module.exports = {
    mcRCON,
};


