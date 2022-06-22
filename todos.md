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

## extensions

- look into ability to `require` things that use `import/export`

## UI

- Figure out sandbox for extensions and apis


## Extension Manager App

- Install extensions/Uninstall extensions
- Show dithered extensions

## HotkeyDetector

- OBS seems to not save the replay buffer until after the timeout expires? maybe we need to do a rename -> then apply rename to the detected file?


## Extension Settings

- Split stores by name, both for extensions and app