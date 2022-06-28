const Store = require("electron-store");
const store = new Store({
  name: "avocapture",
  cwd: "settings",
  clearInvalidConfig: true,
});

const appDefaults = {
  prefix: "Prefix",
};

export class AppSettings {
  save(subKey, value) {
    if (value) {
      store.set(subKey, value);
    } else {
      store.delete(subKey);
    }
  }

  clear(subKey) {
    store.delete(subKey);
  }

  get(subKey) {
    const data = store.get(subKey);
    return data;
  }

  getAll() {
    const all = store.store;
    // nothing set , return default
    if (Object.keys(all).length === 0) {
      return appDefaults;
    }
    return all;
  }
}
