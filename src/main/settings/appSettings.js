import toKeyPath from './settingsKeyUtil';

const Store = require('electron-store');
const store = new Store(
  {
    name: 'avocapture',
    cwd: 'settings',
    clearInvalidConfig: true
  }
);
const settingsSubKey = "app";

const appDefaults = {
  prefix: "Prefix"
};

export class AppSettings {

  saveAll(appSettings) {
    store.set(settingsSubKey, appSettings);
  }

  save(subKey, value) {
    const keyPath = toKeyPath(settingsSubKey, subKey);
    if (value) {
      store.set(keyPath, value);
    }
    else {
      store.delete(keyPath);
    }
  }

  get(subKey) {
    const keyPath = toKeyPath(settingsSubKey, subKey);
    const data = store.get(keyPath);
    return data;
  }

  getAll() {
    return store.get(settingsSubKey, appDefaults);
  }

}