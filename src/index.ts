declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

import { app, BrowserWindow, screen, Tray, Menu, nativeImage } from "electron";
import * as path from "path";

import { dialog } from "electron/main";

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


    mainWindow.webContents.setFrameRate(await fetchRefreshRate())
}

// app.commandLine.appendSwitch('enable-gpu-rasterization');
// app.commandLine.appendSwitch('enable-zero-copy');
// app.commandLine.appendSwitch('disable-software-rasterizer');

// app.commandLine.appendSwitch('disable-http-cache');
// app.commandLine.appendSwitch('disable-renderer-backgrounding');
// app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

// app.commandLine.appendSwitch('use-gl', 'desktop');
// app.commandLine.appendSwitch('enable-features', 'Vulkan');

loadGpuState();
if (getGpuState() === 'OFF') {
    app.disableHardwareAcceleration(); // Ensure GPU is disabled if state is "off"
} else {
    forceGpuOn();
}

app.whenReady().then(async () => {
    tray = new Tray(icon);

    function updateContextMenu(tray: Tray) {
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Snow',
                click: () => {
                    mainWindow?.loadFile(path.resolve(__dirname, '../src/page/snow.html'));
                },
            },
            {
                label: 'Sakura',
                click: () => {
                    mainWindow?.loadFile(path.resolve(__dirname, '../src/page/sakura.html'));
                },
            },
            { type: 'separator' },
            {
                label: `GPU: ${getGpuState()}`, // Dynamically display GPU state
                click: () => {
                    toggleGpu();
                    updateContextMenu(tray); // Rebuild menu after toggling GPU
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

    // tray.setContextMenu(contextMenu);
    tray.setToolTip('Cozy Overlay');
    tray.setTitle('Cozy Overlay');

    await fetchRefreshRate();
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
