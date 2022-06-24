const Store = require('electron-store');

export class ExtensionSettingsStore {

  constructor() {
    this.storesByExtensionName = new Map();
  }

  _getStore(extensionName) {
    return this.storesByExtensionName.get(extensionName);
  }

  initialize(extensionName) {
    // TODO support migrations
    const storeOpts = { name: extensionName, cwd: 'settings' };
    const extStore = new Store(storeOpts);
    this.storesByExtensionName.set(extensionName, extStore);
  }

  get(extensionName) {
    const store = this._getStore(extensionName);
    const defaults = store.get('defaults');
    return store.get('settings', defaults ? defaults : {});
  }

  save(extensionName, newSettings) {
    const store = this._getStore(extensionName);
    store.set('settings', newSettings);
  }

  setDefaults(extensionName, defaults) {
    const store = this._getStore(extensionName);
    store.delete('defaults');
    store.set('defaults', defaults ? defaults : {});
  }
}