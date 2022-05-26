const { globalShortcut } = require('electron')
import { ReplayDetector } from './replayDetector'

export class HotkeyReplayDetector extends ReplayDetector {
  initialize() {
    // do nothing atm
  }

  register(listener) {
    const ret = globalShortcut.register('numadd', () => {
      console.log('numadd is pressed')
      listener.detected("fooBarVas.vid")
    })

    if (!ret) {
      console.log('registration failed')
    }
  }
}