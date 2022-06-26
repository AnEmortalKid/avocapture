const selectedHotkey = "hotkey.selected";
const replayFolder = "hotkey.replayLocation";
const hotkeyDelay = "hotkey.delayMS";

const extensionName = "avocapture-search-on-hotkey";

var nextHotkey = {
  vKey: '', browserName: ''
}

document.getElementById("hotkey.replayLocation.button").addEventListener('click', () => {
  avocapture.actions.selectDirectory((dir) => {
    document.getElementById(replayFolder).value = dir;
  });
});

function bindToForm(data) {
  console.log('bindingToForm');
  const input = document.getElementById(selectedHotkey);
  if (data) {
    const { vKey, browserName } = data;
    input.value = browserName;
    nextHotkey.vKey = vKey
    nextHotkey.browserName = browserName
  }

  input.addEventListener('keydown', e => {
    console.log(`${e} | ${e.code} | ${e.key} | ${e.keyCode}`);
    input.value = e.code;
    nextHotkey.browserName = e.code;
    nextHotkey.vKey = e.keyCode;
    e.preventDefault();
  });

  const delayInput = document.getElementById(hotkeyDelay);
  delayInput.value = data.hotkeyDelayMS

  const replayDirInput = document.getElementById(replayFolder);
  replayDirInput.value = data.replayDirectory;
}

function bindFromForm() {
  // TODO stash in the input?
  const input = document.getElementById(selectedHotkey);
  const delayInput = document.getElementById(hotkeyDelay);
  const replayDirInput = document.getElementById(replayFolder);
  return {
    vKey: nextHotkey.vKey,
    browserName: nextHotkey.browserName,
    hotkeyDelayMS: delayInput.value,
    replayDirectory: replayDirInput.value
  }
}

function bindButtons() {
  var applyBtn = document.getElementById("entry-apply-btn");
  applyBtn.addEventListener("click", submitData);

  var cancelBtn = document.getElementById("entry-cancel-btn");
  cancelBtn.addEventListener("click", cancelForm);
}

function submitData() {
  const data = bindFromForm();
  // TODO disable/don't apply if invalid
  avocapture.extensions.applySettings(data);
}

function cancelForm() {
  avocapture.extensions.cancelSettings();
}

bindButtons();
avocapture.extensions.onInitialize((data) => {
  console.log(`initializing with ${JSON.stringify(data)}`);
  bindToForm(data);
});
