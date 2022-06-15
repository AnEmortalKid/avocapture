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
- Try an actual uploader / create `avocapture-replay-mover` as an uploader


## Extension Manager App

- Install extensions/Uninstall extensions
- Show dithered extensions