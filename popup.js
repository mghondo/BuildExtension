document.addEventListener("DOMContentLoaded", () => {
  const copyBtn = document.getElementById("copyBtn");
  const pasteBtn = document.getElementById("pasteBtn");
  const statusDiv = document.getElementById("status");

  const setStatus = (message, isError = false) => {
    statusDiv.textContent = message;
    statusDiv.className = isError ? "error" : "success";
    setTimeout(() => {
      statusDiv.textContent = "";
      statusDiv.className = "";
    }, 3000);
  };

  copyBtn.addEventListener("click", () => {
    console.log("Copy button clicked in popup.js at:", new Date().toISOString());
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("Sending message to tab:", tabs[0].id);
      chrome.tabs.sendMessage(tabs[0].id, { action: "copyFields" }, (response) => {
        console.log("Response received in popup.js:", response);
        if (chrome.runtime.lastError) {
          console.error("Chrome runtime error:", chrome.runtime.lastError.message);
          setStatus("Failed to copy: " + chrome.runtime.lastError.message, true);
          return;
        }
        if (response && response.success) {
          setStatus("Fields copied successfully!");
        } else {
          setStatus("Failed to copy fields: " + (response?.error || "Unknown error"), true);
        }
      });
    });
  });

  pasteBtn.addEventListener("click", () => {
    console.log("Paste button clicked in popup.js at:", new Date().toISOString());
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("Sending message to tab:", tabs[0].id);
      chrome.tabs.sendMessage(tabs[0].id, { action: "pasteFields" }, (response) => {
        console.log("Response received in popup.js:", response);
        if (chrome.runtime.lastError) {
          console.error("Chrome runtime error:", chrome.runtime.lastError.message);
          setStatus("Failed to paste: " + chrome.runtime.lastError.message, true);
          return;
        }
        if (response && response.success) {
          setStatus("Fields pasted successfully!");
        } else {
          setStatus("Failed to paste fields: " + (response?.error || "Unknown error"), true);
        }
      });
    });
  });
});