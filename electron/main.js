import { app, BrowserWindow } from 'electron';
app.disableHardwareAcceleration();

import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import axios from 'axios';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true, // Hides the default menu bar
    });

    // Load the Vite dev server URL in development, or the bundled index.html in production
    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, the express server will serve the static files on port 3000
        // We wait for the local express server to respond
        mainWindow.loadURL('http://localhost:3000');
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startServer() {
    const isDev = !app.isPackaged;

    if (isDev) {
        // In dev mode, we rely on the concurrently script package.json to start the server.
        // So no need to spawn anything.
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        // In production, start the bundled Express server
        const serverPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'dist-server', 'server.js');

        // Set DB_PATH to user data folder so it has write access
        const dbPath = path.join(app.getPath('userData'), 'safeguard.db');

        serverProcess = spawn(process.execPath, [serverPath], {
            env: {
                ...process.env,
                DB_PATH: dbPath,
                NODE_ENV: 'production',
                ELECTRON_RUN_AS_NODE: '1'
            }
        });

        serverProcess.stdout.on('data', (data) => {
            console.log(`Server: ${data}`);
            if (data.toString().includes('Server running on')) {
                resolve();
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`Server Error: ${data}`);
        });

        serverProcess.on('error', (err) => {
            console.error('Failed to start server process.', err);
            reject();
        });
    });
}

app.whenReady().then(async () => {
    if (app.isPackaged) {
        try {
            await startServer();
        } catch (e) {
            console.error(e);
        }
    }
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});
