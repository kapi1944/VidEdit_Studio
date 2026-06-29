const { app, BrowserWindow } = require("electron");
const sciezka = require("path");

function utworzOknoGlowne() {
  const oknoGlowne = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 860,
    minHeight: 560,
    title: "VidEdit Studio",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (app.isPackaged) {
    oknoGlowne.loadFile(sciezka.join(__dirname, "../../../dist/index.html"));
    return;
  }

  oknoGlowne.loadURL("http://127.0.0.1:5173");
}

app.whenReady().then(() => {
  utworzOknoGlowne();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      utworzOknoGlowne();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
