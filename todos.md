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
- load selected extension on open app
- plug extension to extension dialog - view might not be working for console-echo thingy
  - add frame so we can see dev tools
- npm install extension modules


- extension manager
  - finish wiring flow
  - remove anything from main that doesn't defer to it
  - consider putting things in an ExtensionSettingsApp/Flow/Handler style class

  - Handler (manager, mainWindow);
    - Handler -> also provides the extension actions like 'select directory'