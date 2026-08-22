const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("auraBrowser", {
    openURL: (url) => ipcRenderer.send("open-url", url),
    back: () => ipcRenderer.send("browser-back"),
    forward: () => ipcRenderer.send("browser-forward"),
    reload: () => ipcRenderer.send("browser-reload")
});