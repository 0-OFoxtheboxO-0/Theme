
const Storage = PluginStorage;
const UI = BdApi.UI;
const tokensKey = "savedTokens";

// Simple base64 encode/decode for lightweight "encryption"
function encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decode(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return "";
  }
}

function getTokens() {
  const raw = Storage.get(tokensKey) || [];
  return raw.map(item => ({
    token: decode(item.token),
    nickname: item.nickname
  }));
}

function saveTokens(tokens) {
  const encoded = tokens.map(item => ({
    token: encode(item.token),
    nickname: item.nickname
  }));
  Storage.set(tokensKey, encoded);
}

function addToken(token, nickname) {
  const tokens = getTokens();
  tokens.push({ token, nickname });
  saveTokens(tokens);
}

function removeToken(index) {
  const tokens = getTokens();
  tokens.splice(index, 1);
  saveTokens(tokens);
}

function switchToken(token) {
  window.localStorage.token = `"${token}"`;
  BdApi.alert("Token Switched", "Reloading to apply the new session.");
  location.reload();
}

function createUI() {
  const tokens = getTokens();
  const container = document.createElement("div");

  const tokenInput = document.createElement("input");
  tokenInput.placeholder = "Enter token";
  tokenInput.style.width = "100%";

  const nicknameInput = document.createElement("input");
  nicknameInput.placeholder = "Enter nickname (optional)";
  nicknameInput.style.width = "100%";

  const addButton = document.createElement("button");
  addButton.innerText = "Add Account";
  addButton.onclick = () => {
    if (tokenInput.value) {
      addToken(tokenInput.value, nicknameInput.value);
      BdApi.alert("Token Added", "Restart plugin to see updates.");
    }
  };

  container.append(tokenInput, nicknameInput, addButton);

  tokens.forEach((item, index) => {
    const row = document.createElement("div");
    row.style.marginTop = "10px";

    const name = document.createElement("span");
    name.innerText = item.nickname || `Account ${index + 1}`;
    name.style.marginRight = "10px";

    const switchBtn = document.createElement("button");
    switchBtn.innerText = "Switch";
    switchBtn.onclick = () => switchToken(item.token);

    const delBtn = document.createElement("button");
    delBtn.innerText = "Delete";
    delBtn.style.marginLeft = "5px";
    delBtn.onclick = () => {
      removeToken(index);
      BdApi.alert("Removed", "Restart plugin to update UI.");
    };

    row.append(name, switchBtn, delBtn);
    container.append(row);
  });

  BdApi.showConfirmationModal("Token Switcher", container, {
    confirmText: "Close",
    onConfirm: () => {}
  });
}

module.exports = {
  start() {
    BdApi.showToast("TokenSwitcher Loaded", { type: "success" });
    createUI();
  },
  stop() {
    BdApi.showToast("TokenSwitcher Unloaded", { type: "info" });
  }
};
