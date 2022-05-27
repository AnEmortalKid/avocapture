const { globalShortcut } = require('electron')
import { ReplayDetector } from './replayDetector'

export class HotkeyReplayDetector extends ReplayDetector {
  initialize() {
    // do nothing atm
  }

  register(listener) {
    console.log('registering listener')
    const ret = globalShortcut.register('numadd', () => {
      console.log('numadd is pressed')
      listener.detected("fooBarVas.vid")
    })

    if (!ret) {
      console.log('registration failed')
    }

    const ret2 = globalShortcut.register('numsub ', () => {
      console.log('numsub  is pressed')
      listener.detected("fooBarVas.vid")
    })

    if (!ret2) {
      console.log('registration failed')
    }
  }

  teardown() {
    globalShortcut.unregisterAll();
  }
}