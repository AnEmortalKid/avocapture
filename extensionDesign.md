
## Design design

- extensionName
- settingsDisplay
  - displayName
  - pref width/height
- settings
  - defaults
- export constructor (create)

## Code

- Need to be able to require stuff..... ugh

### Ideas

- could make it export only a form?

## Research

A loader example used require to evaluaste the plug-in config 



So maybe require a main.js that is just an exports





Both types use NPM to install dependencies to the plug-in’s directory. 



install, copies things to the directory and npm installs 



Uninstall, removes from dir. 





On startup: 



load plugins 


Examples:



https://github.com/neurosnap/electron-plugin-manager



https://github.com/artosalminen/electron-plugin-manager



each plug-in defines an extension (singular for now)



extension type
export has to be a function that is a constructor for the extension


Each extension has



a name
Optional:  
  settings view, 
  preferred dimensions 
settings
  defaults 
export / main. That exports the class. 
Type