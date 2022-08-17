const { app } = require("electron");

if (require("electron-squirrel-startup")) {
  app.quit();
}

require("update-electron-app")();

import { runApp } from "./avocapture";

runApp();
