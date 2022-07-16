import { app, clipboard } from 'electron';

export default class PathReader {

  static create() {
    return new PathReader();
  }

  constructor() {
    this.read = app.getPath("userData");
    clipboard.writeText(this.read);
  }
}