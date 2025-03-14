const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const axios = require('axios'); // For making HTTP requests to Flask API

let mainWindow;
let selectedFolderPath = null; // Variable to store the folder path

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true, // Allows us to use Electron APIs in React
            contextIsolation: false
        }
    });

    mainWindow.loadURL('http://localhost:5173'); // Load your React app

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

// Handle snip saving when React requests it
ipcMain.handle('save-snip', async (event, snipData) => {
    // If no folder has been selected yet, prompt the user
    if (!selectedFolderPath) {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });

        if (!result.canceled) {
            selectedFolderPath = result.filePaths[0]; // Save the folder path
            console.log(`Folder selected: ${selectedFolderPath}`);
        } else {
            return { error: 'No folder selected for saving the snip.' };
        }
    }

    if (selectedFolderPath) {
        const snipPath = `${selectedFolderPath}/snip.png`;

        try {
            fs.writeFileSync(snipPath, snipData); // Save snip as an image
            console.log(`Snip saved at: ${snipPath}`);

            // Send path to Flask to save in the selected folder
            const response = await axios.post('http://127.0.0.1:5000/save-snip', {
                snipPath: snipPath, // Send the path to the Flask backend
            });

            return response.data; // Return the response data (file path or success message)
        } catch (error) {
            console.error('Error saving snip:', error);
            return { error: 'Failed to save snip.' };
        }
    }

    return null;
});
