const Store = require('electron-store');
const store = new Store();

const keyPath = "app";

const appDefaults = {
  prefix: "Prefix"
};

export class AppSettings {

  saveAll(appSettings) {
    store.set('app', appSettings);
  }

  save(subKey, value) {
    if (value) {
      store.set('app.' + subKey, value);
    }
    else {
      store.delete('app.' + subKey);
    }
  }

  get(subkey) {
    const data = store.get('app.' + subkey);
    return data;
  }

  getAll() {
    return store.get('app', appDefaults);
  }

}