const { ipcRenderer } = require('electron');

console.log('Manager loaded');

ipcRenderer.on('ExtensionManagement.Initialize', (event, data) => {
  console.log(data);
});


/* 
<li class="w3-bar w3-disabled">
  <button class="w3-button w3-round w3-theme-action w3-right">Uninstall <i class="fa fa-trash"></i></button>
  <div class="w3-bar-item">
    <span class="w3-large">Search on Hotkey</span><br>
  </div>
  <div class="w3-bar-item">
    <p>An extension for avocapture that searches the filesystem when a hotkey is pressed.</p>
  </div>
</li> 
*/
function createListItem(extensionName) {


}
