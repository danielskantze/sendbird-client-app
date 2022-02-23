// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electron", {
  loadConfig: () => {
      return ipcRenderer.invoke("app:load-config");
  },
  saveConfig: (config) => {
    return ipcRenderer.invoke("app:save-config", config);
  }
});