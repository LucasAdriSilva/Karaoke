const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openDownloadsPage: () => ipcRenderer.send('openDownloadsPage'),
    downloadVideo: (url) => ipcRenderer.send('download-video', url),
    openDownloads: () => ipcRenderer.send('open-downloads'),
    onDownloadComplete: (callback) => ipcRenderer.on('download-complete', callback),
    onDownloadError: (callback) => ipcRenderer.on('download-error', callback),
    openPath: (filePath) => ipcRenderer.invoke('open-file', filePath),

    onDownloadsList: (callback) => ipcRenderer.on('downloads-list', callback),
    onDownloadsListError: (callback) => ipcRenderer.on('downloads-list-error', callback),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
    send: (channel, data) => ipcRenderer.send(channel, data),
    changeNameVideo: (oldName, newName) => ipcRenderer.send('changeNameVideo', oldName, newName)
});
