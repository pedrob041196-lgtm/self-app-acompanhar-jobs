const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true // Oculta a barra de menus do OS para um visual mais limpo
  });

  // Em produção, ele vai carregar os arquivos construídos do Vite (./dist/index.html)
  // Em dev, se quiséssemos, carregaríamos o localhost:3000
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  
  // Opcional: mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
