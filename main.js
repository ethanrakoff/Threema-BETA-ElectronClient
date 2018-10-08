const {app, Tray, Menu, BrowserWindow} = require('electron');
const open = require('open');
const path = require('path');
const url = require('url');
const shell = require('electron').shell;
const ipc = require('electron').ipcMain;
const nativeImage = require('electron').nativeImage;

let mainWindow;
let isQuitting = false;
let iconPath = path.join(__dirname, 'favicon.ico');
let tray = null;

function handleRedirect(event, url) {
    event.preventDefault();
    open(url);
}

function createTray() {
    tray = new Tray(nativeIcon.createFromPath(iconPath));

    let contextMenu = Menu.buildFromTemplate([
        {label: 'Show App', click: function () {
                mainWindow.show();
            }},
        {label: 'Quit', click: function () {
                isQuitting = true;
                app.quit();
            }}
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('Electron Threema Wrapper');
    tray.setTitle('Threema');
}

function createWindow() {
    mainWindow = new BrowserWindow({width: 800, height: 800, icon: iconPath});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.on('minimize', function (event) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.webContents.on('new-window', handleRedirect);
    mainWindow.webContents.on('will-navigate', handleRedirect);
}

app.on('ready', function() {
    createTray();
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});

function getLocation(href) {
    let match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
}

ipc.on('webview-navigate', function(event, url) {
    let protocol = getLocation(url).protocol;

    if (protocol === 'http:' || protocol === 'https:') {
        shell.openExternal(url)
    }
});
