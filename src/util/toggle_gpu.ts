import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

// Use __dirname to store the config in the program folder (development or packaged app folder)
const CONFIG_PATH = path.join(__dirname, '../', '../', '../', 'config.json');

let isGpuEnabled = true; // Default value

// Load the GPU state from the config file
export function loadGpuState() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
            isGpuEnabled = JSON.parse(data).isGpuEnabled ?? true;
        }
    } catch (err) {
        console.error('Failed to load GPU state:', err);
    }
}

// Save the GPU state to the config file
function saveGpuState() {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ isGpuEnabled }));
    } catch (err) {
        console.error('Failed to save GPU state:', err);
    }
}

export function forceGpuOn(): void {
    app.commandLine.appendSwitch('enable-gpu-rasterization');
    app.commandLine.appendSwitch('enable-zero-copy');
    app.commandLine.appendSwitch('disable-software-rasterizer');
    app.commandLine.appendSwitch('use-gl', 'desktop');
    app.commandLine.appendSwitch('enable-features', 'Vulkan');
}

export function toggleGpu(): void {
    // Toggle the GPU state
    isGpuEnabled = !isGpuEnabled;

    // Save the new GPU state
    saveGpuState();

    // Apply the new GPU settings based on the state
    if (isGpuEnabled) {
        forceGpuOn()
    } else {
        // Disable GPU acceleration before the app is ready
        app.once('ready', () => {
            app.disableHardwareAcceleration();
        });
    }

    // Relaunch the app with the new GPU settings
    app.relaunch();
    app.quit();
}

// Export the state of the GPU (for the tray menu or other UI)
export function getGpuState() {
    return isGpuEnabled ? 'ON' : 'OFF';
}
