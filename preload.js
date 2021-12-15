const { contextBridge, ipcRenderer} = require("electron");
contextBridge.exposeInMainWorld(
  "api", {
    send: (data, channel = "sound") => { // レンダラーからの送信用
      ipcRenderer.send(channel, data);
    },
    on: (callback, channel = "sound") => { // メインプロセスからの受信用
      ipcRenderer.on(channel, (event, args) => {
        callback(args)
      })
    }
  }
)
