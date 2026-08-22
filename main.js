const {
    app,
    BrowserWindow,
    WebContentsView,
    ipcMain
} = require("electron");

const path = require("path");

let win;
let webView;

function createWindow() {

    win = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 650,
        backgroundColor: "#0b0b12",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile(
        path.join(__dirname, "browser.html")
    );

    webView = new WebContentsView({
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.contentView.addChildView(webView);

    webView.setBounds({
        x: 0,
        y: 62,
        width: 1400,
        height: 838
    });

    webView.webContents.loadURL(
        "https://www.google.com"
    );

    win.on("resize", () => {

        const [width, height] =
            win.getContentSize();

        webView.setBounds({
            x: 0,
            y: 62,
            width: width,
            height: height - 62
        });

    });
}

app.whenReady().then(() => {

    createWindow();

    app.on("activate", () => {

        if (
            BrowserWindow.getAllWindows()
                .length === 0
        ) {
            createWindow();
        }

    });

});


ipcMain.on("open-url", (event, url) => {

    if (!webView) return;

    url = url.trim();

    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {

        url =
            "https://www.google.com/search?q=" +
            encodeURIComponent(url);
    }

    webView.webContents.loadURL(url);

});


ipcMain.on("browser-back", () => {

    if (
        webView &&
        webView.webContents.canGoBack()
    ) {
        webView.webContents.goBack();
    }

});


ipcMain.on("browser-forward", () => {

    if (
        webView &&
        webView.webContents.canGoForward()
    ) {
        webView.webContents.goForward();
    }

});


ipcMain.on("browser-reload", () => {

    if (webView) {
        webView.webContents.reload();
    }

});


app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }

});