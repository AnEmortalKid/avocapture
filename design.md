


## Detection

* Each detector needs a settings page for individual things

* Store data somewhere by detector


## Uploader

* Each uploader needs a settings view 
* Maybe capture listings ?



## UI

Prefix:
INPUT


* Try Grid with both options and gears?

### Plugin Settings

* Save -> broadcast "ExtensionSettings.Apply" : `{ pluginName: id, data: {} }`
* Cancel -> broadcast "ExtensionSettings.Cancel"
* Modify -> broadcast "ExtensionSettings.Modify": `{ pluginName: id }`

#### Renderer

* Init -> broadcast "ExtensionSettings.Initialize.pluginName"
