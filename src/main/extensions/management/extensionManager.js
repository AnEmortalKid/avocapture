import { app } from "electron";
import ExtensionLoader from "../loader/extensionLoader";
import { ExtensionSettingsStore } from "../../settings/extensionSettings";
import installExtension from "../installer/extensionInstaller";
import Logger from "../../logger/logger";
const fs = require("fs");
const path = require("path");

const extensionLoader = new ExtensionLoader();
const extensionSettingsStore = new ExtensionSettingsStore();

const logger = new Logger("ExtensionManager");

/**
 * Manages the lifecycle of extensions
 */
export default class ExtensionManager {
  constructor() {
    this.extensions = {};
    this.detectorNames = [];
    this.uploaderNames = [];
    this.active = [];
  }

  registerChangeListener(changeListener) {
    this.changeListener = changeListener;
  }

  notifyListener(eventData) {
    if (this.changeListener) {
      this.changeListener(eventData);
    }
  }

  /**
   * Must be called once "app" is ready
   * @param {filePath} extensionPath file path for the location of the extension
   * @return the name of the extension based on the package json
   */
  install(extensionPath) {
    logger.logMethod("install", extensionPath);
    const extensionName = installExtension(extensionPath);

    return extensionName;
  }

  uninstall(extensionName) {
    logger.logMethod("uninstall", extensionName);
    const extension = this.extensions[extensionName];

    if (this.active.includes(extensionName)) {
      this.deactivate(extensionName);
    }

    const destinationRoot = app.getPath("userData");
    const extensionsPath = path.join(destinationRoot, "extensions");

    // ensure we don't accidentally delete the wrong thing
    if (
      extension.extensionPath &&
      extension.extensionPath.startsWith(extensionsPath)
    ) {
      fs.rmdirSync(extension.extensionPath, { force: true, recursive: true });
    }

    this._unstoreExtension(extension);
    this.notifyListener({
      event: "uninstall",
      name: extensionName,
      type: extension.type(),
    });
  }

  loadInstalled() {
    const destinationRoot = app.getPath("userData");
    const extensionsPath = path.join(destinationRoot, "extensions");
    this.loadExtensions(extensionsPath);
  }

  _storeExtension(extension) {
    this.extensions[extension.name()] = extension;

    // TODO pass in migrations object
    extensionSettingsStore.initialize(extension.name());
    extensionSettingsStore.setDefaults(
      extension.name(),
      extension.configuration.settings?.defaults
    );

    const extensionData = {
      extensionName: extension.name(),
      displayName: extension.display(),
    };

    if (extension.type() === "detector") {
      this.detectorNames.push(extensionData);
    }
    if (extension.type() === "uploader") {
      this.uploaderNames.push(extensionData);
    }
  }

  _unstoreExtension(extension) {
    delete this.extensions[extension.name()];

    extensionSettingsStore.clear(extension.name());

    this.detectorNames = this.detectorNames.filter(
      (data) => data.extensionName != extension.name()
    );
    this.uploaderNames = this.uploaderNames.filter(
      (data) => data.extensionName != extension.name()
    );
  }

  loadExtensions(filePath) {
    logger.logMethod("loadExtensions", filePath);
    const loaded = extensionLoader.loadExtensions(filePath);
    for (var extension of loaded) {
      this._storeExtension(extension);
    }
  }

  loadExternal(extensionName) {
    logger.logMethod("loadExtension", extensionName);
    const destinationRoot = app.getPath("userData");
    const extensionPath = path.join(
      destinationRoot,
      "extensions",
      extensionName
    );
    const loaded = extensionLoader.loadExtension(extensionPath);
    this._storeExtension(loaded);

    this.notifyListener({ event: "loadExternal", name: extensionName });
  }

  getExtensionsOfType(type) {
    if (type === "detector") {
      return this.detectorNames;
    }
    if (type === "uploader") {
      return this.uploaderNames;
    }
  }

  getExtensionNames() {
    return Object.keys(this.extensions);
  }

  getExtension(extensionName) {
    return this.extensions[extensionName];
  }

  getExtensionSettings(extensionName) {
    return extensionSettingsStore.get(extensionName);
  }

  activate(extensionName) {
    logger.logMethod("activate", extensionName);

    this.active.push(extensionName);
    const settings = extensionSettingsStore.get(extensionName);
    const instance = this.extensions[extensionName].instance;
    instance.initialize(settings);
  }

  deactivate(extensionName) {
    logger.logMethod("deactivate", extensionName);
    const instance = this.extensions[extensionName].instance;
    instance.teardown();
    this.active = this.active.filter((e) => e !== extensionName);
  }

  shutdown() {
    for (const ae of this.active) {
      logger.log("Deactivating " + ae);
      this.deactivate(ae);
    }
  }

  edit(extensionName) {
    logger.logMethod("edit", extensionName);
    const instance = this.extensions[extensionName].instance;
    instance.notifyModifying();
    this.editingContext = extensionName;
  }

  applyEdit(extensionName, newSettings) {
    logger.logMethod("applyEdit", extensionName);
    const instance = this.extensions[extensionName].instance;
    // TODO compare old settings to new settings 
    extensionSettingsStore.save(extensionName, newSettings);
    instance.notifyModifyApply(newSettings);
  }

  cancelEdit(extensionName) {
    logger.logMethod("cancelEdit", extensionName);
    const instance = this.extensions[extensionName].instance;
    instance.notifyModifyCancel();
  }
}
