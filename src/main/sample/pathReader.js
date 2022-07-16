import { app, clipboard } from 'electron';

const appPath = app.getPath("userData");

export default class PathReader {

  static create() {
    return new PathReader();
  }

  constructor() {
    this.read = app.getPath("userData");
    clipboard.writeText(this.read);
  }
}