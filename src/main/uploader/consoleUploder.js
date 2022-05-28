import { ReplayUploader } from "./replayUploader";

export class ConsoleUploader extends ReplayUploader {

  initialize() {
    console.log('[consoleUploader] init')
  }
  upload(fileName) {
    console.log('[uploading]')
  }
}