# How to Create a Windows .EXE for DEL.js Apps 🚀

This guide explains how to convert your DEL.js HTML application into a standalone Windows Executable (`.exe`) file using **Microsoft Edge App Mode** and a Batch script—with **zero npm/Node.js setup required**.

---

## 🛠️ Step-by-Step Guide

### Step 1: Create the Batch Script (`Run_App.bat`)

1. Open your DEL.js project folder (where `index.html` is located).
2. Create a new text file and paste the following code:

```bat
@echo off
:: Launches Microsoft Edge in standalone App Mode with specified window size
start msedge --app="%~dp0index.html" --window-size=450,550
1. Save the file as **`Run_App.bat`** (Ensure "Save as type" is set to *All Files*).

---

### Step 2: Convert `.bat` to a Standalone `.exe` File

To make it look like a real desktop app with a custom icon, convert the batch file to `.exe`:

#### Method A: Using BAT to EXE Converter (Easiest)
1. Download and run a free **BAT to EXE Converter** tool.
2. Select **`Run_App.bat`** as the source file.
3. In the options, set **Visibility** to **Invisible Application** (this hides the command prompt popup).
4. Select a custom `.ico` file for your App Icon.
5. Click **Compile / Convert** to generate your final **`App.exe`**.

#### Method B: Using Inno Setup / IExpress (Built-in Windows Tool)
1. Press `Win + R`, type **`iexpress`**, and press Enter.
2. Follow the wizard to package your `index.html`, `del.js`, and `Run_App.bat` into an installation package.

---

## ⚡ Benefits of Edge App Mode

- **Zero Dependency:** Uses built-in Microsoft Edge on Windows 10/11/12.
- **Ultra Lightweight:** No heavy Node.js or Chromium binaries bundled into your app.
- **Native Look:** Removes browser tabs, URL bar, and address controls for a clean app window.
