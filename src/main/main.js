const { app } = require("electron");

if (require("electron-squirrel-startup")) {
  app.quit();
}

import { runApp } from "./avocapture";

runApp();
