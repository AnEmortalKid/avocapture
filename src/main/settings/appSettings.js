const Store = require('electron-store');
const store = new Store();

// TODO make plugin specific slots
export class AppSettings {

  saveApp(settings) {
    store.set('app', settings);
  }

  getApp() {
    return store.get('app', {
      prefix: "Prefix"
    });
  }

  save(key, data) {
    store.set(key, data);
  }

  get(settingsKey, defaults) {
    return store.get(settingsKey, defaults);
  }
}