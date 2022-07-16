import { app } from "electron";

const path = require("path");
const fs = require("fs");

export function logCleaner() {
  const logPath = path.join(app.getPath("userData"), "logs/main.log");
  if (fs.existsSync(logPath)) {
    fs.rmSync(logPath);
  }
}
