const { app, BrowserWindow, ipcMain, Menu, Dialog} = require("electron")
const path = require('path')

//process.env.NODE_ENV = 'production'

app.on("ready", () => {
	let mainWindow = new BrowserWindow({
    frame: true,
    height: 600,
    width: 1000,
		minWidth: 550,
		minHeight: 450,
    show: false,
		icon: path.join(__dirname, 'assets/icons/png/icon1024x1024.png')})
	mainWindow.loadURL(path.join('file://',__dirname,'/src/index.html'))
	mainWindow.once('ready-to-show', () => { mainWindow.show() })

	if(process.env.NODE_ENV === 'production'){
		mainWindow.setMenu(null);
	}

	//ipcMain.on("mainWindowLoaded", function () {
	//	let result = knex.select("voornaam").from("spelers")
	//	result.then(function(rows){
	//		mainWindow.webContents.send("resultSent", rows);
	//	})
	//});
});



app.on('window-all-closed', () => { app.quit() })
