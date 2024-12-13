import { exec } from 'child_process';
import os from 'os';

type RefreshRateResult = number | null;

/**
 * Retrieves the monitor refresh rate based on the current platform.
 * @returns A Promise that resolves with the refresh rate (number) or null on failure.
 */
export async function getMonitorFrameRate(): Promise<RefreshRateResult> {
    const platform = os.platform();

    return new Promise((resolve, reject) => {
        if (platform === 'win32') {
            exec('wmic path Win32_VideoController get CurrentRefreshRate', (err, stdout) => {
                if (err) {
                    return reject(new Error('Error fetching refresh rate on Windows'));
                }
                const match = stdout.match(/\d+/);
                if (match) {
                    return resolve(parseInt(match[0], 10));
                }
                return resolve(null);
            });
        } else if (platform === 'linux') {
            exec('xrandr | grep "*" | cut -d" " -f4', (err, stdout) => {
                if (err) {
                    return reject(new Error('Error fetching refresh rate on Linux'));
                }
                const rate = parseFloat(stdout.trim());
                if (!isNaN(rate)) {
                    return resolve(rate);
                }
                return resolve(null);
            });
        } else if (platform === 'darwin') {
            exec('system_profiler SPDisplaysDataType | grep Resolution', (err, stdout) => {
                if (err) {
                    return reject(new Error('Error fetching refresh rate on macOS'));
                }
                const match = stdout.match(/(\d+) Hz/);
                if (match) {
                    return resolve(parseInt(match[1], 10));
                }
                return resolve(null);
            });
        } else {
            return resolve(null);
        }
    });
}

/**
 * Fallback method to estimate the frame rate by counting frames in a second.
 * @returns A Promise that resolves with the estimated frame rate (number) or null if it fails.
 */
export async function fallbackEstimateFrameRate(): Promise<RefreshRateResult> {
    return new Promise((resolve) => {
        let frameCount = 0;
        let startTime = performance.now();

        function measure() {
            frameCount++;
            const now = performance.now();
            if (now - startTime >= 1000) {
                resolve(frameCount);
            } else {
                requestAnimationFrame(measure);
            }
        }

        measure();
    });
}

/**
 * Fetches the monitor's refresh rate using the appropriate method (either native or fallback).
 * @returns A Promise that resolves with the refresh rate (number) or 60 as a default value if it cannot be determined.
 */
export async function fetchRefreshRate(): Promise<number> {
    try {
        const rate = await getMonitorFrameRate();
        if (rate !== null) {
            return rate;
        } else {
            throw new Error('Failed to fetch a valid refresh rate');
        }
    } catch (err) {
        try {
            const fallbackRate = await fallbackEstimateFrameRate();
            if (fallbackRate !== null) {
                return fallbackRate;
            } else {
                throw new Error('Failed to estimate refresh rate');
            }
        } catch (fallbackErr) {
            return 60;
        }
    }
}
