// main.js

// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const path = require('path')
const Music = require('./music.js')
const sensor = require('./sensor/build/Release/sensor');
const Common = require("./lib/common.js")

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    useContentSize: true,
    transparent: true,
    show: true,
    frame: false,
    resizable: true,
    autoHideMenuBar: true,
    //'always-on-top': true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.setFullScreen(true);

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  return mainWindow
}

const music = new Music()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const win = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  win.webContents.on('did-finish-load', () => {

    ipcMain.on('sensor::set_distance_range', (event, rcv) => { 
      sensor.set_distance_range(...rcv)
    })

    let offX = 0
    ipcMain.on('sensor::start', (event, rcv) => { 

      offX += 2.0 * Math.PI / 20
      if (true) {
        const width  = 320
        const height = 160  
        const heightmap = []
        for (let i = 0; i < width; ++i) {
          const x = 10.0 * Math.PI * (i / width) + offX
          //const h = (Math.sin( x ) + 1.0) * height / 8
          const h = height / 8
          heightmap.push(h)
        }
        const sd = {
          width: width, 
          height: height, 
          heightmap: heightmap
        }
        win.webContents.send("sensor::data", sd) // レンダラープロセスへsendしています
      } else {
        sensor.start(0.1, 6.0, function () {
          console.log("Done!!")
        }, function(str) {
          const sd = JSON.parse(str)
          win.webContents.send("sensor::data", sd) // レンダラープロセスへsendしています
        }); 
      }

    })
  })
})

app.on('before-quit', function (e) {
  music.kill()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
