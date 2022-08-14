const { ipcRenderer } = require("electron");

/* 
  <li class="w3-container w3-disabled">
  // if builtin 
        <span class="w3-tag w3-theme-l1 w3-padding w3-round-large w3-right">Builtin</span>
        else 
    <button class="w3-button w3-round w3-theme-action w3-right">Uninstall <i class="fa fa-trash"></i></button>
    <div>
      <span class="w3-large">Test Extension</span><br>
    </div>
    <div>
      <p>Short paragraph.</p>
    </div>
  </li>
*/
function createListItem(extensionInfo) {
  const li = document.createElement("li");
  li.classList.add("w3-container");
  if (extensionInfo.isBuiltIn) {
    const span = document.createElement("span");
    span.classList.add(
      "w3-tag",
      "w3-theme-d1",
      "w3-padding",
      "w3-round-large",
      "w3-right",
      "w3-disabled"
    );
    span.textContent = "Built-in";
    li.appendChild(span);
  } else {
    const uninstallBtn = document.createElement("button");
    uninstallBtn.classList.add(
      "w3-button",
      "w3-round",
      "w3-theme-action",
      "w3-right"
    );
    uninstallBtn.onclick = () => {
      ipcRenderer.send("ExtensionManagement.Uninstall", extensionInfo.name);
    };

    const uninstallIcon = document.createElement("i");
    uninstallIcon.classList.add("fa", "fa-trash");
    uninstallBtn.appendChild(uninstallIcon);
    li.appendChild(uninstallBtn);
  }

  const nameDiv = document.createElement("div");
  const nameSpan = document.createElement("span");
  nameSpan.classList.add("w3-large");
  nameSpan.textContent = extensionInfo.display;
  nameDiv.appendChild(nameSpan);
  li.appendChild(nameDiv);

  const descriptionDiv = document.createElement("div");
  const descriptionP = document.createElement("p");
  descriptionP.textContent = extensionInfo.description;
  descriptionDiv.appendChild(descriptionP);
  li.appendChild(descriptionDiv);

  return li;
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function bindFromData(data) {
  const listHolder = document.getElementById("list-item-container");
  removeAllChildNodes(listHolder);

  // TODO sort alpha?
  for (var extensionInfo of data) {
    const li = createListItem(extensionInfo);
    listHolder.append(li);
  }
}

document.getElementById("install-extension-btn").onclick = () => {
  ipcRenderer.send("AppActions.SelectDirectory");
};

document.getElementById("close-btn").onclick = () => {
  ipcRenderer.send("ExtensionManagement.Close");
};

ipcRenderer.on("AppActions.SelectDirectory.Response", (event, data) => {
  if (data && data.length > 0) {
    ipcRenderer.send("ExtensionManagement.Install", data);
  }
});

ipcRenderer.on("ExtensionManagement.Initialize", (event, data) => {
  bindFromData(data);
});
