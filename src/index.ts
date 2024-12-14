declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

import { app, BrowserWindow, screen, Tray, Menu, nativeImage } from "electron";
import * as path from "path";

import { dialog, ipcMain } from "electron/main";

import { fetchRefreshRate } from "./util/screen_handler";
import { forceGpuOn, getGpuState, loadGpuState, toggleGpu } from "./util/toggle_gpu";

if (require('electron-squirrel-startup')) app.quit();

let tray;
const icon = nativeImage.createFromPath(path.join(__dirname, '../icon.png'));
let mainWindow: BrowserWindow | null = null;

async function createWindow() {
    const display = screen.getPrimaryDisplay();
    const workArea = display.workArea;

    let factor = display.scaleFactor;
    const [x, y] = [workArea.width, workArea.height];
    const [px, py] = [workArea.x, workArea.y];

    mainWindow = new BrowserWindow({
        width: x / factor,
        height: y / factor,

        alwaysOnTop: true,
        frame: false,
        transparent: true,
        skipTaskbar: true,

        icon: icon,

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            zoomFactor: 1.0 / factor,
        },
    });

    mainWindow.setPosition(px, py)
    mainWindow.setIgnoreMouseEvents(true)
    mainWindow.loadFile(path.resolve(__dirname, '../src/page/snow.html'));

    const rate = await fetchRefreshRate();
    mainWindow.webContents.setFrameRate(rate);
}

ipcMain.handle('get-refresh-rate', async () => {
    const refreshRate = await fetchRefreshRate();
    return refreshRate;
});

loadGpuState();
if (getGpuState() === 'OFF') {
    app.disableHardwareAcceleration();
} else {
    forceGpuOn();
}

let devToolsWindow;
function createDevToolsWindow() {
    devToolsWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    devToolsWindow.loadURL('about:blank'); // Just an empty window for DevTools

    mainWindow?.webContents.openDevTools({ mode: 'detach' });

    devToolsWindow.on('closed', () => {
        devToolsWindow = null;
    });
}

app.whenReady().then(async () => {
    tray = new Tray(icon);

    function updateContextMenu(tray: Tray) {
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Snowflakes',
                click: () => {
                    mainWindow?.loadFile(path.resolve(__dirname, '../src/page/snow.html'));
                },
            },
            {
                label: 'Sakura petals',
                click: () => {
                    mainWindow?.loadFile(path.resolve(__dirname, '../src/page/sakura/sakura.html'));
                },
            },
            {
                label: 'DVD logo',
                click: () => {
                    mainWindow?.loadFile(path.resolve(__dirname, '../src/page/dvd/index.html'));
                },
            },
            {
                label: 'Ribbons',
                click: () => {
                    mainWindow?.loadFile(path.resolve(__dirname, '../src/page/ribbon/index.html'));
                },
            },
            { type: 'separator' },
            {
                label: `GPU: ${getGpuState()}`,
                click: () => {
                    toggleGpu();
                    updateContextMenu(tray);
                }
            },
            {
                label: 'Dev tools',
                click: () => {
                    createDevToolsWindow();
                }
            },
            {
                label: 'About',
                click: () => {
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Cozy Overlay',
                        message: 'Cozy Overlay Desktop\nVersion 0.0-alpha\n',
                        detail: 'A simple ambient animated overlay desktop application.\nby Setsuna (puff-dayo)',
                        buttons: ['OK!']
                    });
                }
            },
            {
                label: 'Quit',
                click: () => {
                    app.quit();
                }
            }
        ]);

        tray.setContextMenu(contextMenu);
    }

    updateContextMenu(tray)

    tray.setToolTip('Cozy Overlay');
    tray.setTitle('Cozy Overlay');

    await fetchRefreshRate();
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
