
import { EventEmitter } from 'events';

/**
 * Handles the orchestration of loading the initial components and notifying completion.
 * 
 * This abstraction only exists to make it easier to not have to mock the emitter for the avocapture app's tests.
 */
export class AppLoader {

  constructor() {
    this.emitter = new EventEmitter();
  }

  load(loadingFunction) {
    loadingFunction();
    this._finished();
  }

  onFinished(doneCallback) {
    this.emitter.on('finished', doneCallback);
  }

  _finished() {
    this.emitter.emit('finished');
  }
}