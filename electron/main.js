const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;
let selectedFolderPath = null; // Variable to store the selected folder path

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173"); // Your React app URL

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

// Handle folder selection from React
ipcMain.handle("set-folder-path", (event, folderPath) => {
  selectedFolderPath = folderPath;
  console.log(`Folder selected: ${selectedFolderPath}`);
});

// Handle snip saving in the selected folder
ipcMain.handle("save-snip", async (event, snipData, folderPath) => {
  const saveFolder = folderPath || selectedFolderPath;

  if (saveFolder) {
    const snipPath = path.join(saveFolder, "snip.png");

    try {
      fs.writeFileSync(snipPath, snipData); // Save snip to selected folder
      console.log(`Snip saved at: ${snipPath}`);
      return { file_path: snipPath }; // Return the snip path
    } catch (error) {
      console.error("Error saving snip:", error);
      return { error: "Failed to save snip." };
    }
  }

  return null; // If no folder path is available, return null
});


