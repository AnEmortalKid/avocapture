const Store = require('electron-store');
const store = new Store();

export class AppSettings {

  save(appSettings) {
    store.set('app', appSettings);
  }

  save(subKey, value) {
    store.set('app.' + subKey, value);
  }

  get() {
    return store.get('app', {
      prefix: "Prefix"
    });
  }

}