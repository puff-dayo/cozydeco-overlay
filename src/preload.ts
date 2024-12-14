import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    getRefreshRate: async () => {
        const refreshRate = await ipcRenderer.invoke('get-refresh-rate');
        return refreshRate;
    },
});
