# Ghost Hand

Ghost Hand is an Electron desktop text assistant that runs from the menu bar. It captures highlighted text, opens a small prompt window with a global shortcut, and can paste the resulting text back into the previously active app.

## Features

- Menu bar/tray-style desktop app
- Global shortcut for opening the prompt window
- Highlighted-text capture flow
- Settings window and prompt window
- Clipboard-based selected-text replacement
- macOS AppleScript integration through `node-osascript`
- React renderer bundled with Webpack
- Electron Builder packaging for macOS, Windows, and Linux
- GitHub release publishing configuration

## Tech stack

- Electron
- React 18
- Webpack
- Tailwind CSS
- OpenAI SDK
- Axios
- menubar
- node-osascript
- electron-builder

## Getting started

Install dependencies:

```bash
npm install
```

Create a `.env` file if your local build needs API credentials:

```bash
OPENAI_API_KEY=your_openai_api_key
```

Run the app in development mode:

```bash
npm run dev
```

Run the simpler local start command:

```bash
npm start
```

## Available scripts

```bash
npm start       # Build once and launch Electron
npm run dev     # Run Webpack dev server and Electron together
npm run build   # Build renderer and package the app
npm run compile # Compile an unpacked app directory
npm run release # Build and publish through electron-builder
```

## Project structure

```text
main/            # Electron main-process logic, menubar, shortcuts, windows
assets/          # App icons and desktop assets
utils/           # Shared helpers, if present
dist/            # Built renderer output
build/           # Signing/notarization assets
scripts/         # Release/notarization scripts
```

## Desktop behavior

On macOS, the app hides the dock icon and runs as a menu bar utility. The current shortcut is:

```text
Command + ,
```

The prompt flow captures selected text, opens an always-on-top prompt window, then uses the clipboard and AppleScript to paste replacement text back into the previously active app.

## Release notes

The Electron Builder config includes macOS signing/notarization settings and GitHub release publishing. Before releasing, verify app IDs, signing identity, dependency versions, icons, entitlements, and GitHub publish settings.

## Status

This is an experimental AI desktop utility. Review accessibility permissions, clipboard behavior, security settings, and dependency versions before distributing broadly.
