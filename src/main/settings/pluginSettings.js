const Store = require('electron-store');
const store = new Store();
const keyPath = 'extensions.';

export class PluginSettingsStore {

  // TODO add keypath/pathify function
  get(pluginName) {
    const defaults = store.get(pluginName + '.defaults');
    return store.get(pluginName + '.settings', defaults ? defaults : {});
  }

  save(pluginName, newSettings) {
    store.set(pluginName + '.settings', newSettings);
  }

  setDefaults(pluginName, defaults) {
    store.set(pluginName + '.defaults', defaults);
  }
}