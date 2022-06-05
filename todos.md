- HotkeySettings and Dialog flow
  - Think about how other things would plug into it


- Callback/way to track a replay "uploaded" , pass something to uploader to NotifyCompletion
  - Main UI updates state with a little Green checkmark or something

 - need schema etc


 ## Keys

- Need to figure out the `const production` part for the WinKeyServer filepath
  - path isn't different somehow?

## Plugin Flow

* Update from hotkeySettings everywhere to plugin generic settings


## Prefix

Remove invalid chars like `/` or `\`

## HOtkey

- Check initial settings not defaulting to a correct keybind listeer until something presses apply
- Maybe not the worst thing to require one time setup ^

-- Configure location to search
-- ? Searcher? 
--- Search on Hotkey


## Plugin notes

-- Separate plugin settings store

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
