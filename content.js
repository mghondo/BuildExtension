window.console.log("content.js loaded at:", new Date().toISOString());
window.console.log("content.js injected into page:", window.location.href);
window.console.log("DOM access test - <body> element:", document.body);

// Immediate debug log to confirm script injection
window.console.log("Content script is running on:", window.location.href);

// Listen for messages from the React app to save values
window.addEventListener('message', (event) => {
  if (event.data.type === 'SAVE_FIELDS') {
    chrome.storage.local.set({ savedFields: event.data.data }, () => {
      window.console.log('Fields saved to chrome.storage.local under savedFields:', event.data.data);
    });
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    window.console.log("Message received in content.js:", request);
    if (request.action === "copyFields") {
      window.console.log("Copy Fields action triggered at:", new Date().toISOString());
      window.console.log("Current page URL:", window.location.href);
      window.console.log("Current document title:", document.title);

      const packageIdInput = document.getElementById('packageId');
      const mNumberInput = document.getElementById('mNumber');
      const productNameInput = document.getElementById('productName');
      const daysSupplyInput = document.getElementById('daysSupplyInput');
      const thcInput = document.getElementById('thc');
      const cbdInput = document.getElementById('cbd');
      const typeInput = document.getElementById('type');
      const strainInput = document.getElementById('strain');
      const weightInput = document.getElementById('weight');

      window.console.log("packageIdInput element:", packageIdInput);
      window.console.log("mNumberInput element:", mNumberInput);
      window.console.log("productNameInput element:", productNameInput);
      window.console.log("daysSupplyInput element:", daysSupplyInput);
      window.console.log("thcInput element:", thcInput);
      window.console.log("cbdInput element:", cbdInput);
      window.console.log("typeInput element:", typeInput);
      window.console.log("strainInput element:", strainInput);
      window.console.log("weightInput element:", weightInput);

      const packageIdValue = packageIdInput ? packageIdInput.value : '';
      const mNumberValue = mNumberInput ? mNumberInput.value : '';
      const productNameValue = productNameInput ? productNameInput.value : '';
      const daysSupplyValue = daysSupplyInput ? daysSupplyInput.value : '';
      const thcValue = thcInput ? thcInput.value : '';
      const cbdValue = cbdInput ? cbdInput.value : '';
      const typeValue = typeInput ? typeInput.value : '';
      const strainValue = strainInput ? strainInput.value : 'No Strain';
      const weightValue = weightInput ? weightInput.value : '';

      chrome.storage.local.get("savedFields", (existingData) => {
        const existingFields = existingData.savedFields || {};
        const updatedFields = {
          packageId: packageIdValue,
          mNumber: mNumberValue,
          productName: productNameValue,
          daysSupply: daysSupplyValue,
          thc: thcValue,
          cbd: cbdValue,
          type: typeValue,
          strain: strainValue,
          weight: weightValue
        };

        const preservedFields = {};
        if (existingFields.company) {
          preservedFields.company = existingFields.company;
        }
        if (existingFields.drivers) {
          preservedFields.drivers = existingFields.drivers;
        }
        if (existingFields.subType) {
          preservedFields.subType = existingFields.subType;
        }
        if (existingFields.expirationDate) {
          preservedFields.expirationDate = existingFields.expirationDate;
        }
        if (existingFields.flowerEquivalent) {
          preservedFields.flowerEquivalent = existingFields.flowerEquivalent;
        }
        if (existingFields.cost) {
          preservedFields.cost = existingFields.cost;
        }

        const data = {
          ...existingFields,
          ...updatedFields,
          ...preservedFields
        };

        window.console.log("Fields to save (after merging with existing):", data);

        chrome.storage.local.set({ savedFields: data }, () => {
          window.console.log("Saved fields to chrome.storage.local:", data);
          sendResponse({ success: true, values: data });
        });
      });
      return true;
    } else if (request.action === "pasteFields") {
      window.console.log("Paste Fields action triggered at:", new Date().toISOString());
      window.console.log("Current page URL:", window.location.href);

      const isSimulationForm = window.location.href.includes('dut-simulation') || window.location.href.includes('dutsimulation');
      const isDutchie = window.location.href.includes('dutchie.com');
      const isTestHtml = window.location.href.toLowerCase().includes('test.html');
      window.console.log("Checking page type - isTestHtml:", isTestHtml, "URL:", window.location.href.toLowerCase());
      window.console.log("Checking page type - isSimulationForm:", isSimulationForm, "URL:", window.location.href);
      window.console.log("Checking page type - isDutchie:", isDutchie, "URL:", window.location.href);

      if (isTestHtml) {
        window.console.log("Detected test.html page. Attempting to paste into daysSupply input...");
        const daysSupplyInput = document.getElementById('daysSupplyInput');
        window.console.log("daysSupplyInput element:", daysSupplyInput);
        if (daysSupplyInput) {
          chrome.storage.local.get("savedFields", (data) => {
            window.console.log("Retrieved saved fields for pasting in test.html:", data.savedFields);
            if (data.savedFields) {
              daysSupplyInput.value = data.savedFields.daysSupply || '';
              daysSupplyInput.dispatchEvent(new Event('input', { bubbles: true }));
              daysSupplyInput.dispatchEvent(new Event('change', { bubbles: true }));
              window.console.log("Successfully pasted daysSupply in test.html:", data.savedFields.daysSupply);
              sendResponse({ success: true });
            } else {
              window.console.log("No saved fields found in storage.");
              sendResponse({ success: false, error: "No saved fields found. Please copy the fields first." });
            }
          });
        } else {
          const daysSupplyByName = document.querySelector('input[name="daysSupply"]');
          window.console.log("Trying alternative selector - daysSupply by name:", daysSupplyByName);
          window.console.log("Document body for debugging:", document.body.innerHTML);
          sendResponse({ 
            success: false, 
            error: "Days supply input not found in test.html."
          });
        }
        return true;
      } else if (isSimulationForm) {
        window.console.log("Detected simulation form page. Checking tab...");
        const navTabs = document.querySelector('.nav-tabs');
        window.console.log("Nav tabs element:", navTabs);
        const activeTabElement = document.querySelector('.nav-tabs .nav-link.active');
        window.console.log("Active tab element:", activeTabElement);
        const activeTab = activeTabElement?.getAttribute('data-rr-ui-event-key') || activeTabElement?.getAttribute('eventKey');
        window.console.log("Active tab eventKey:", activeTab);

        // Define fields present on each tab
        const fieldsByTab = {
          main: {
            company: document.getElementById('company'),
            drivers: document.getElementById('drivers')
          },
          productOuter: {
            packageId: document.getElementById('packageId'),
            mNumber: document.getElementById('mNumber'),
            expirationDate: document.getElementById('expirationDate'),
            cost: document.getElementById('cost'),
            flowerEquivalent: document.getElementById('flowerEquivalent')
          },
          productInner: {
            productName: document.getElementById('productName'),
            productSku: document.getElementById('productSku'),
            type: document.getElementById('type'),
            subType: document.getElementById('subType'),
            strain: document.getElementById('strain'),
            daysSupply: document.getElementById('daysSupply'),
            weight: document.getElementById('weight'),
            thc: document.getElementById('thc'),
            cbd: document.getElementById('cbd'),
            itemDetails: document.getElementById('itemDetails')
          }
        };

        const currentTabFields = fieldsByTab[activeTab] || {};
        window.console.log("Fields available on current tab (" + activeTab + "):", currentTabFields);

        // Add specific debug logs for expirationDate and flowerEquivalent when on productOuter tab
        if (activeTab === 'productOuter') {
          window.console.log("Immediate check - expirationDate input in DutSimulationForm:", currentTabFields.expirationDate);
          window.console.log("Immediate check - flowerEquivalent input in DutSimulationForm:", currentTabFields.flowerEquivalent);
        }

        // Check if at least one field is present on the current tab to proceed
        const hasFields = Object.values(currentTabFields).some(field => field !== null);
        if (!hasFields) {
          window.console.log("No fields found on the current tab:", activeTab);
          sendResponse({ 
            success: false, 
            error: "No fields available to paste on the current tab."
          });
          return true;
        }

        // Retrieve saved fields and paste them directly
        chrome.storage.local.get("savedFields", (data) => {
          window.console.log("Retrieved saved fields for pasting:", data.savedFields);
          if (!data.savedFields) {
            window.console.log("No saved fields found in storage.");
            sendResponse({ success: false, error: "No saved fields found. Please copy the fields first." });
            return;
          }

          const pasteValue = (input, value) => {
            if (input && value) {
              input.value = value;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              window.console.log("Pasted value into", input.id, ":", value);
            } else {
              window.console.log("Skipping paste - Input:", input, "Value:", value);
            }
          };

          // Paste fields based on the active tab
          if (activeTab === 'main') {
            pasteValue(currentTabFields.company, data.savedFields.company);
            pasteValue(currentTabFields.drivers, data.savedFields.drivers);
            window.console.log("Successfully pasted available fields on tab:", activeTab);
            sendResponse({ success: true });
          } else if (activeTab === 'productOuter') {
            pasteValue(currentTabFields.packageId, data.savedFields.packageId);
            pasteValue(currentTabFields.mNumber, data.savedFields.mNumber);
            pasteValue(currentTabFields.expirationDate, data.savedFields.expirationDate);
            pasteValue(currentTabFields.cost, data.savedFields.cost);
            pasteValue(currentTabFields.flowerEquivalent, data.savedFields.flowerEquivalent);
            window.console.log("Successfully pasted available fields on tab:", activeTab);
            sendResponse({ success: true });
          } else if (activeTab === 'productInner') {
            // Paste fields that don't depend on conditional rendering first
            pasteValue(currentTabFields.productName, data.savedFields.productName);
            pasteValue(currentTabFields.productSku, data.savedFields.productSku);
            pasteValue(currentTabFields.strain, data.savedFields.strain);
            pasteValue(currentTabFields.daysSupply, data.savedFields.daysSupply);
            pasteValue(currentTabFields.weight, data.savedFields.weight);
            pasteValue(currentTabFields.thc, data.savedFields.thc);
            pasteValue(currentTabFields.cbd, data.savedFields.cbd);
            pasteValue(currentTabFields.itemDetails, data.savedFields.itemDetails);

            // Paste type first, then wait for subType to render
            if (currentTabFields.type && (data.savedFields.type === 'Flower' || data.savedFields.type === 'Edible')) {
              pasteValue(currentTabFields.type, data.savedFields.type);

              // Use MutationObserver to wait for subType to appear in the DOM
              const observer = new MutationObserver((mutations, obs) => {
                const subTypeInput = document.getElementById('subType');
                if (subTypeInput) {
                  window.console.log("Found subType input after type change:", subTypeInput);
                  pasteValue(subTypeInput, data.savedFields.subType);
                  obs.disconnect();
                }
              });

              observer.observe(document.body, { childList: true, subtree: true });

              // Fallback: If subType doesn't appear within 5 seconds, proceed
              setTimeout(() => {
                observer.disconnect();
                const subTypeInput = document.getElementById('subType');
                if (!subTypeInput) {
                  window.console.log("Failed to find subType input after 5 seconds.");
                }
                window.console.log("Successfully pasted available fields on tab:", activeTab);
                sendResponse({ success: true });
              }, 5000);
            } else {
              pasteValue(currentTabFields.type, data.savedFields.type);
              window.console.log("Successfully pasted available fields on tab:", activeTab);
              sendResponse({ success: true });
            }
          } else {
            window.console.log("Successfully pasted available fields on tab:", activeTab);
            sendResponse({ success: true });
          }
        });
        return true;
      } else if (isDutchie) {
        window.console.log("Detected Dutchie page. Using stable selectors to paste fields...");
        const observer = new MutationObserver((mutations, obs) => {
          const daysSupplyInput = document.querySelector('input[name="daysSupply"]');
          const thcInput = document.querySelector('input[name="thc"]');
          const cbdInput = document.querySelector('input[name="cbd"]');
          if (daysSupplyInput && thcInput && cbdInput) {
            window.console.log("Found Dutchie input elements:", { daysSupplyInput, thcInput, cbdInput });
            chrome.storage.local.get("savedFields", (data) => {
              window.console.log("Retrieved saved fields for pasting in Dutchie:", data.savedFields);
              if (data.savedFields) {
                const pasteValue = (input, value) => {
                  input.value = value || '';
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                };
                pasteValue(daysSupplyInput, data.savedFields.daysSupply);
                pasteValue(thcInput, data.savedFields.thc);
                pasteValue(cbdInput, data.savedFields.cbd);
                window.console.log("Successfully pasted fields in Dutchie:", data.savedFields);
                sendResponse({ success: true });
              } else {
                window.console.log("No saved fields found in storage.");
                sendResponse({ success: false, error: "No saved fields found. Please copy the fields first." });
              }
            });
            obs.disconnect();
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
          observer.disconnect();
          const daysSupplyInput = document.querySelector('input[name="daysSupply"]');
          if (!daysSupplyInput) {
            window.console.log("Failed to find days supply input in Dutchie after 10 seconds.");
            sendResponse({ 
              success: false, 
              error: "Days supply input not found on Dutchie page."
            });
          }
        }, 10000);
        return true;
      } else {
        window.console.log("Page not recognized for pasting:", window.location.href);
        sendResponse({ 
          success: false, 
          error: "Page not recognized for pasting."
        });
        return false;
      }
    }
    return true;
  } catch (error) {
    window.console.error("Error in content.js onMessage listener:", error);
    sendResponse({ success: false, error: "An error occurred in content.js: " + error.message });
    return true;
  }
});