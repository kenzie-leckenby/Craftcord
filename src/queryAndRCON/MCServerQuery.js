const util = require('minecraft-server-util');
const { serverIP, serverPort } =  require('../../config.json')

const options = {
    timeout: 5000,
    enableSRV: true
};

// This will work for any minecraft server version at or above version 1.7.2
function checkServerStatus() {
    return new Promise((resolve, reject) => {
        const outputObj = {}
        util.queryFull(serverIP, serverPort, options)
            .then(result => {
                outputObj.motd = result.motd.clean;
                outputObj.currentVersion  = result.version;
                resolve(outputObj);
            })
            .catch(error => {
                console.error(error)
                reject(error)
            })
    })
}

function checkPlayerInfo() {
    return new Promise((resolve, reject) => {
        const outputObj = {};
        util.queryFull(serverIP, serverPort, options)
            .then(result => {
                outputObj.numPlayersOn = result.players.online;
                outputObj.maxPlayers = result.players.max;
                outputObj.playersOnList = result.players.list.length === 0 ? 'No Players On' : result.players.list;
                resolve(outputObj);
            })
            .catch(error => {
                console.error(error)
                reject(error)
            });
    });
}

module.exports = {
    checkServerStatus,
    checkPlayerInfo,
};