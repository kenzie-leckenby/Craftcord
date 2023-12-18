const util = require('minecraft-server-util');
const { serverIP, serverPort } =  require('../../config.json')

const options = {
    timeout: 1000,
    enableSRV: true
};

/**
 * works for any minecraft server version at or above version 1.7.2
 * @returns an object containing motd, currentVersion, maxPlayers, online, playersOnList, and icon. If unable to query it returns null,
 */
function checkServerStatus() {
    return new Promise((resolve) => {
        const outputObj = {}
        util.status(serverIP, serverPort, options)
            .then(result => {
                let playersList = [];
                result.players.sample != null && result.players.sample.forEach(element => {
                    playersList.push(element.name)
                });

                outputObj.motd = result.motd.clean;
                outputObj.currentVersion = result.version.name;
                outputObj.maxPlayers = result.players.max;
                outputObj.online = result.players.online;
                outputObj.playersOnList = result.players.online > 0 ? playersList.join(', ') : 'No Players On';
                outputObj.icon = result.favicon;
                resolve(outputObj);
            })
            .catch(() => {
                console.log('Unable to Query Server, check your IP and Port');
                resolve(null);
            })
    })
}

module.exports = {
    checkServerStatus,
};