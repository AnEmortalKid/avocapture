

- Prefix settings in main UI -> propagate to some state
  - Perhaps an AppSettings

- Settings view for the HotkeyDetector
  - Think about how other things would plug into it


- List of Replays captured this session


- Callback/way to track a replay "uploaded" , pass something to uploader to NotifyCompletion
  - Main UI updates state with a little Green checkmark or something

- Use electron-store to save locs
 - need schema etc


 ## Keys

 - Browser: "NumpadSubtract"
 - Global: VK_STUFF

 Both are 109

 -> Browser -> Set "NumpadSubtract" as the name, but keycode as the value
 -> Global -> use e.vKey as the value

 -- settings:  
 {
   vKey: 111,
   browserName: "NumpadSubtract"
 }
 