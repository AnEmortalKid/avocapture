const Store = require('electron-store');
const store = new Store();
const keyPath = 'extensions.';

export class PluginSettingsStore {

  // TODO add keypath/pathify function
  get(pluginName) {
    const defaults = store.get(keyPath + pluginName + '.defaults');
    return store.get(keyPath + pluginName + '.settings', defaults ? defaults : {});
  }

  save(pluginName, newSettings) {
    store.set(keyPath + pluginName + '.settings', newSettings);
  }

  setDefaults(pluginName, defaults) {
    store.delete(keyPath + pluginName);
    store.set(keyPath + pluginName + '.defaults', defaults ? defaults : {});
  }
}