const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const os = require("os");

let win;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadURL("http://localhost:5173"); // Vite default port
});

// 📂 Create a new folder on the desktop
ipcMain.handle("create-folder", async (_, folderName) => {
  const desktopPath = path.join(os.homedir(), "Desktop", folderName);
  if (!fs.existsSync(desktopPath)) {
    fs.mkdirSync(desktopPath);
  }
  return desktopPath;
});

// 📄 Get all files from a selected folder
ipcMain.handle("get-files-in-folder", async (_, folderPath) => {
  return fs.existsSync(folderPath) ? fs.readdirSync(folderPath) : [];
});

// 📤 Save uploaded files into the selected folder
ipcMain.handle("save-file-to-folder", async (_, filePath, folderPath) => {
  const destination = path.join(folderPath, path.basename(filePath));
  fs.copyFileSync(filePath, destination);
  return destination;
});
