// menubar.js
const path = require('path');
const url = require('url');
const electron = require('electron');
const osascript = require('node-osascript');
const captureHighlightedText = require('./textCapture');

const { Tray, Menu, globalShortcut, app, BrowserWindow, screen, ipcMain } = electron;

let settingsWindow = null;
let promptWindow = null;
let previousApp = null;

function createMenubar() {
  console.log('Creating menubar...');
  const tray = new Tray(path.join(__dirname, '../assets/MenubarIconTemplate.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click: createSettingsWindow,
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('right-click', () => {
    tray.popUpContextMenu();
  });

  tray.on('double-click', () => {
    tray.popUpContextMenu();
  });

  registerGlobalShortcut();

  return tray;
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 300,
    height: 400,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const settingsUrl = url.format({
    pathname: path.join(__dirname, '..', 'dist', 'index.html'),
    protocol: 'file:',
    slashes: true,
    hash: 'settings',
  });

  settingsWindow.loadURL(settingsUrl);

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      settingsWindow.hide();
    }
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

async function showPromptWindow() {
  const highlightedText = await captureHighlightedText(true);

  // Get the frontmost application
  osascript.execute(
    `tell application "System Events" to get name of first application process whose frontmost is true`,
    (err, result) => {
      if (err) {
        console.error('Error getting frontmost application:', err);
        return;
      }
      previousApp = result;

      createPromptWindow();
    },
  );
}

function createPromptWindow() {
  const cursorPosition = screen.getCursorScreenPoint();

  if (promptWindow) {
    promptWindow.show();
    promptWindow.focus();
    return;
  }

  promptWindow = new BrowserWindow({
    width: 400,
    height: 200,
    x: cursorPosition.x,
    y: cursorPosition.y,
    alwaysOnTop: true,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const promptUrl = url.format({
    pathname: path.join(__dirname, '..', 'dist', 'index.html'),
    protocol: 'file:',
    slashes: true,
    hash: 'prompt',
  });

  promptWindow.loadURL(promptUrl);

  promptWindow.once('ready-to-show', () => {
    promptWindow.show();
    promptWindow.focus();
    // If you have highlighted text to send, you can send it here
    promptWindow.webContents.send('highlighted-text', highlightedText);
  });

  promptWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      promptWindow.hide();
    }
  });

  promptWindow.on('closed', () => {
    promptWindow = null;
  });
}

function replaceSelectedText(text) {
  // Escape special characters in the text
  const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");

  const script = `
    tell application "${previousApp}"
      activate
      delay 0.1
      tell application "System Events"
        keystroke "${escapedText}"
      end tell
    end tell
  `;

  osascript.execute(script, (err) => {
    if (err) {
      console.error('Error executing AppleScript:', err);
      return;
    }
    console.log('Replaced selected text');
  });
}

function registerGlobalShortcut() {
  try {
    const registered = globalShortcut.register('Command+,', showPromptWindow);

    if (!registered) {
      console.log('Shortcut registration failed');
    }
  } catch (error) {
    console.error('Error registering shortcut:', error);
  }
}

// Set up IPC communication
ipcMain.on('submit-input', (event, input) => {
  const newText = input + ' test';
  if (promptWindow) {
    promptWindow.close();
  }
  replaceSelectedText(newText);
});

module.exports = createMenubar;
