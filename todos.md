- Callback/way to track a replay "uploaded" , pass something to uploader to NotifyCompletion
  - Main UI updates state with a little Green checkmark or something


## Plugin notes

```json
avocapture: {
  name: pluginName,
  settings: index.html
  export:  { detector }
  exports: main.js
}
```

```
module.exports = 
  displaySettings: {
    width, height
  },
  extensionSettings: {
    defaults: {
      
    }
  }
```

```
plugin/
  settings/
    index.html
    main.js
  module.js
```


- save selected extensions
  - wire extension unselect / teardown and re-select
   - Debug through flow since something isn't activating correctly
   - perhaps it is the selection part / not activating / hotkey
   - add a `none` option for selection
   - load extensions to frontend + set selected
- load selected extension on open app
- npm install extension modules

## extensions

- rename PluginSettings event to ExtensionSettings
- remove pluginName from around