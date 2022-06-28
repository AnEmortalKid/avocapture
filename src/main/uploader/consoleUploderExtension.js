import { ReplayUploaderExtension } from "./replayUploader";

export class ConsoleUploader extends ReplayUploaderExtension {
  initialize(settings) {
    console.log("[consoleUploader] init");
  }
  upload(fileName) {
    console.log("[Seeing] ", fileName);
  }
}
