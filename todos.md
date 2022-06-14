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

