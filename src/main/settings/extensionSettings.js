import toKeyPath from './settingsKeyUtil';

const Store = require('electron-store');
const store = new Store();
const settingsSubKey = 'extensions';

export class ExtensionSettingsStore {

  get(extensionName) {
    const defaults = store.get(toKeyPath(settingsSubKey, extensionName, 'defaults'));
    return store.get(toKeyPath(settingsSubKey, extensionName, 'settings'), defaults ? defaults : {});
  }

  save(extensionName, newSettings) {
    const keyPath = toKeyPath(settingsSubKey, extensionName, 'settings')
    store.set(keyPath, newSettings);
  }

  setDefaults(extensionName, defaults) {
    store.delete(toKeyPath(settingsSubKey, extensionName));
    store.set(toKeyPath(settingsSubKey, extensionName, 'defaults'), defaults ? defaults : {});
  }
}