const Store = require('electron-store');
const store = new Store();

export class PluginSettingsStore {

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