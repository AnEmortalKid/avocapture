import { app } from 'electron'

export function isProduction() {
  // Work around to debug in vscode like we are packaged
  const avoProp = process?.env?.DEBUG_PROD === 'true'

  return app.isPackaged || avoProp;
}

export function isAvocaptureDebug() {
  return process?.env?.AVOCAPTURE_DEBUG === 'true'
}