import { screen } from 'electron'; // Import Electron's screen module

type RefreshRateResult = number | null;

/**
 * Retrieves the monitor refresh rate using the Electron screen API.
 * @returns A Promise that resolves with the refresh rate (number) or null on failure.
 */
export async function getMonitorFrameRate(): Promise<RefreshRateResult> {
    return new Promise((resolve, reject) => {
        try {
            // Get the primary display's refresh rate using the Electron screen API
            const primaryDisplay = screen.getPrimaryDisplay();
            const refreshRate = primaryDisplay.displayFrequency;

            if (refreshRate) {
                resolve(refreshRate);
            } else {
                resolve(null);
            }
        } catch (err) {
            console.error('Error fetching refresh rate from Electron screen API:', err);
            resolve(null); // Return null if there's an error
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
 * Fetches the monitor's refresh rate using the appropriate method (either Electron API or fallback).
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
            return 60; // Default to 60 if both methods fail
        }
    }
}
