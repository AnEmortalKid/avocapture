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

### Exporting

The extension module should by default export a class:

```java
class MyExtension {
initialize(settings);
teardown();
notifyModifying();
notifyModifyApply(newSettings);
notifyModifyCancel();
upload(replayData)
}
module.exports = MyExtension
```

### Configuration

An extension must define additional metadata in its `package.json` for Avocapture to load it. 

Properties *required* from the `package.json`:

* `name`: Name of your extension. 
  * Should be unique across all other extensions. 
  * Should not start with `avocapture`.
  * This name also defines the directory the extension is installed to.
* `main`: defines where the extension is exported from
* `version`: defines the version of the extension, used when determining if an extension needs installed/updated.

Defined in an `avocapture` object and includes the following properties:

* `type`: The extension type one of (`detector`,`uploader`)
  * *Required*
* `display`: A user friendly name for the extension. This item is visible in the ui.
  * *Required* 
* `settings`: An object that defines both UI and extension settings. 
  * *Required*

#### Settings

* `defaults`: defines any default values needed for the extension to work out of the box
* `view`: defines any UI related settings
  * `entry`: a relative path to an HTML page where the extension's settings can be modified.
  * `width`: the preferred width for the extension editor
  * `height`: the preferred height for the extension editor


_Sample fully defined avocapture object_
```json
"avocapture": {
    "name": "My first extension",
    "type": "detector",
    "display": "Detects with magic",
    "settings": {
      "defaults": {
        "useMagic": true,
        "magicType": "secret"
      },
      "view": {
        "entry": "index.html",
        "width": 200,
        "height": 200
      }
    }
  }
```

## View

The `view` property is optional and defines a user interface where the extension's settings can be modified.

### Entry

The *required* `entry` property defines a relative path to an `html` file which defines a `form`.

### Event System

The `avocapture` application communicates with a side process which hosts your UI. It uses `ipc` to send and receive messages between the main application and your extension's page.

When initializing your UI, the `ExtensionSettings.Initialize.your-extension-name` message will be sent with an object containing all the defined settings (or defaults if you defined defaults and no settings exist).

When the extensions settings are finalized and should be saved, your UI should send the `ExtensionSettings.Apply` event with an object containing the new settings under a `settings` key:
```json
{
  "settings": {
    "yourProp": "yourvalue"
  }
}
```

If you provide an additional mechanism for closing the UI, without saving the settings, it should send the `ExtensionSettings.Cancel` event.

### Styling

A couple of `css` sheets will be copied relative to your extension's installation directory under an `assets` directory, which you can then link. You may also provide these with your extension if desired.

They will be found at the following locations:

```
<link rel="stylesheet" href="./assets/css/w3.css" />
<link rel="stylesheet" href="./assets/css/theme.css" />
<link rel="stylesheet" href="./assets/font-awesome-4.7.0/css/font-awesome.min.css">
```

This is the same styling the rest of the application uses.

### Layout

The provided extensions follow a `header, form, footer` layout, which you can copy to keep the styling consistent:

```html
<header class="w3-container w3-theme-l4 w3-card">
  <h4 class="w3-center">Hotkey Settings</h4>
</header>

<div id="form-container" class="w3-theme-l4">
  <form class="w3-container" onsubmit="submitData()">

    <div class="w3-container w3-section">
      <div class="w3-row w3-third">
        <label>Hotkey</label>
      </div>
      <div class="w3-row">
        <input id="hotkey.selected" class="w3-input w3-border" type="text" placeholder="Prefix">
      </div>
    </div>

    <input type="submit" hidden />
  </form>
</div>

<footer class="w3-container w3-padding w3-theme-l4">
  <div class="w3-bar w3-center">
    <button class="w3-button w3-round w3-theme-action" id="entry-apply-btn">Apply</button>
    <button class="w3-button w3-round w3-theme-action" id="entry-cancel-btn">Close</button>
  </div>
</footer>
```

### Renderer

Your extension's UI runs in a `Browser` window and is effectively a [renderer](https://www.electronjs.org/docs/latest/glossary#renderer-process) in electron. 

For now, you are able to use the `ipcRenderer` module from your UI's javascript context:
```
const { ipcRenderer } = require("electron");
```

:warning: This will change in the future

### Storage

* This application uses [electron-store](https://github.com/sindresorhus/electron-store) with some customization.
* Your extension's settings will be stored under `%APPDATA%/avocapture/settings/your-extension-name.json`. 


## Developer Tips

* The `builtins` directory has some sample extensions that can be referenced.
* Avocapture will check the version of the extension from the `package.json`. If your changes aren't being picked up:
  * Run the app with an `AVOCAPTURE_DEBUG` environment variable set to `true` to skip version checking.
  * either bump the version 
  * delete the `%APPDATA%/avocapture/extensions` directory for your extension.
