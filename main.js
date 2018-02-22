const {app, Tray, Menu, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
let isQuitting = false;
let iconPath = path.join(__dirname, 'favicon.ico');
let tray = null;

function createTray() {
    tray = new Tray(iconPath);

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
    tray.setToolTip("Electron Threema Wrapper");
    tray.setTitle("Threema");
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