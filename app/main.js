const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process');
const log = require('../src/logs/logWriter.js');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

  win.loadFile('index.html');
};

let childProcess;

app.whenReady().then(() => {
    createWindow();
    childProcess = spawn('node', ['src/index.js']);
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
            childProcess = spawn('node', ['src/index.js']);
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        log.close();
        childProcess.kill();
    }
});