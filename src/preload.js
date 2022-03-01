// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require('electron');

let currentCallId = 0;

function nextCallId() {
    return currentCallId++;
}

class IpcMainCallError extends Error {
    constructor(message) {
        super(message);
    }
}

contextBridge.exposeInMainWorld('electron', {
    loadConfig: (key, defaultConfig) => {
        const callId = nextCallId();
        return new Promise((resolve, reject) => {
            ipcRenderer.once('app:' + callId, (event, arg) => {
                if (!arg) {
                    reject(new IpcMainCallError("loadConfig failed"));
                    return;
                }
                resolve(arg);
            });
            ipcRenderer.invoke('app:load-config', { callId, key, defaultConfig });
        });
    },
    saveConfig: (key, data) => {
        const callId = nextCallId();
        return new Promise((resolve, reject) => {
            ipcRenderer.once('app:' + callId, (event, arg) => {
                if (!arg) {
                    reject(new IpcMainCallError("saveConfig failed"));
                    return;
                }
                resolve(arg);
            });
            ipcRenderer.invoke('app:save-config', { callId, key, data });
        });
    },
    generateId: (length) => {
        const callId = nextCallId();
        return new Promise((resolve, reject) => {
            ipcRenderer.once('app:' + callId, (event, arg) => {
                if (!arg) {
                    reject(new IpcMainCallError("generateId failed"));
                    return;
                }
                resolve(arg);
            });
            ipcRenderer.invoke('app:generate-id', { callId, length });
        });
    }
});
