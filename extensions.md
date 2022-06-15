# extensions

Avocapture provides the ability to load/unload new extensions for a set of defined entrypoints.

## Entrypoints

* `detector`: responsible for determining when a replay file is ready and sending the file path to a listener
* `uploader`: responsible for handling a renamed replay file and uploading it somewhere

## Creating an Extension

An extension is an exported class that defines all the lifecycle functions and the functions required for each entrypoint type.

### Lifecycle Functions

All extensions must have these functions defined:

```js
/**
 * Initializes the state of the extension based on the given settings.
 * 
 * @param {*} settings the settings specific to this extension
 */
initialize(settings);

/**
 * Destroys any state the extension requires
 */
teardown();

/**
 * The extension's settings are in the process of being modified. 
 * 
 * An extension can use this function to pause any side processes (example: a listener for ShadowPlay) while the settings are being modified.
 */
notifyModifying();

/**
 * The extension has new settings
 * 
 * @param {*} newSettings the new settings specific to this extension
 */
notifyModifyApply(newSettings);

/**
 * The extension's settings were not changed.
 */
notifyModifyCancel();
```

### Entrypoint Functions

#### Detector

A `detector` notifies the application that a replay was created/found through the `ReplayDetectionListener`. The detector's responsibility is to call the `detected` method on the listener with an object containing:

* `fileName`: the name of the replay file, with extension.
* `filePath`: the full path for the replay file

A `detector` receives the listener via the register method. 

```js
/**
 * Registers a listener with this detector. 
 */
register(listener) {
  throw new Error("Unimplemented");
}
```

#### Uploader

An `uploader` uploads the replay to a desired destination. The uploader will be called with an object containing:

* `fileName`: the name of the replay file, with extension.
* `filePath`: the full path for the replay file

### Configuration

An extension must define additional metadata in its `package.json` for Avocapture to load it. 

The configuration is defined in an `avocapture` object and includes the following properties:

* `name`: Name of your extension. Should be unique across all other extensions. Should not start with `avocapture`.
* `type`: The extension type one of (`detector`,`uploader`)
* `display`: A user friendly name for the extension. This item is visible in the ui. 


```json
"avocapture": {
    "name": "Name of your Extension",
    "type": "detector",
    "display": "Search on Hotkey",
    "settings": {
      "defaults": {
        "vKey": 111,
        "browserName": "NumpadDivide",
        "replayDirectory": "~/Videos",
        "hotkeyDelayMS": 500
      },
      "view": {
        "entry": "index.html",
        "width": 500,
        "height": 500
      }
    }
  }
```