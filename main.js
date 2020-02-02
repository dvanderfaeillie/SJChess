const { app, BrowserWindow, ipcMain, Menu, Dialog} = require("electron")
const path = require('path')

process.env.NODE_ENV = 'production'

app.on('ready', () => {
	// Initializing the database file
	const fs = require('fs')
	const file = './src/test.db'
	try {
	  if (!fs.existsSync(file)) {
			const sqlite3 = require('sqlite3')
			var db = new sqlite3.Database(file)
			db.serialize(function() {
				db.run('CREATE TABLE partijen( id INTEGER PRIMARY KEY AUTOINCREMENT, whitePlayerId INTEGER, blackPlayerId INTEGER, result INTERGER DEFAULT 0, date DATE, ts DATETIME DEFAULT CURRENT_TIMESTAMP)')
				db.run('CREATE TABLE players( id INTEGER PRIMARY KEY AUTOINCREMENT, surname VARCHAR(128), name VARCHAR(128), sex CHAR, tournamentId INT)')
				db.run('CREATE TABLE tournaments( id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR (128), date DATE, ts DATETIME DEFAULT CURRENT_TIMESTAMP , active BOOLEAN DEFAULT 1)')
			})
	  }
	} catch(err) {
	  console.error(err)
	}


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
		mainWindow.setMenu(null)
	} else {
		mainWindow.openDevTools()
	}
});



app.on('window-all-closed', () => { app.quit() })
