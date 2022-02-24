// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require('electron');

let currentCallId = 0;

function nextCallId() {
    return currentCallId++;
}

contextBridge.exposeInMainWorld('electron', {
    loadConfig: key => {
        const callId = nextCallId();
        return new Promise((resolve, reject) => {
            ipcRenderer.once('app:' + callId, (event, arg) => {
                resolve(arg);
            });
            ipcRenderer.invoke('app:load-config', { callId, key });
        });
    },
    saveConfig: (key, data) => {
        const callId = nextCallId();
        return new Promise((resolve, reject) => {
            ipcRenderer.once('app:' + callId, (event, arg) => {
                resolve(arg);
            });
            ipcRenderer.invoke('app:save-config', { callId, key, data });
        });
    },
});
