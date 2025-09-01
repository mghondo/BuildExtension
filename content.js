window.console.log("content.js loaded at:", new Date().toISOString());
window.console.log("content.js injected into page:", window.location.href);
window.console.log("DOM access test - <body> element:", document.body);

// Immediate debug log to confirm script injection
window.console.log("Content script is running on:", window.location.href);

// Test for CSP restrictions
try {
  const testDiv = document.createElement('div');
  testDiv.textContent = 'CSP Test';
  document.body.appendChild(testDiv);
  window.console.log("CSP Test: Successfully appended a test div to the DOM.");
  testDiv.remove();
} catch (error) {
  window.console.error("CSP Test: Failed to append test div. Possible CSP restriction:", error.message);
}

// Listen for messages from the React app to save values
window.addEventListener('message', (event) => {
  // Debug log for ALL messages
  window.console.log('📨 Message received from page:', event.data);
  window.console.log('Message origin:', event.origin);
  
  if (event.data.type === 'SAVE_FIELDS') {
    window.console.log('✅ SAVE_FIELDS message detected!');
    window.console.log('📦 Data to save:', event.data.data);
    
    try {
      // Check if chrome.storage is available
      if (chrome && chrome.storage && chrome.storage.local) {
        window.console.log('🔧 chrome.storage.local is available, attempting to save...');
        
        chrome.storage.local.set({ savedFields: event.data.data }, () => {
          if (chrome.runtime.lastError) {
            window.console.error('❌ Error saving fields to chrome.storage:', chrome.runtime.lastError);
          } else {
            window.console.log('✅ Fields successfully saved to chrome.storage.local!');
            window.console.log('💾 Saved data:', event.data.data);
            
            // Verify the save by reading it back
            chrome.storage.local.get('savedFields', (result) => {
              window.console.log('🔍 Verification - Data in storage:', result.savedFields);
            });
          }
        });
      } else {
        window.console.error('❌ chrome.storage.local is not available');
        window.console.log('Chrome object:', typeof chrome);
        window.console.log('Chrome.storage object:', chrome?.storage);
      }
    } catch (error) {
      window.console.error('❌ Error in SAVE_FIELDS handler:', error);
      window.console.log('Error stack:', error.stack);
    }
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    window.console.log("Message received in content.js:", request);
    if (request.action === "copyFields") {
      window.console.log("🔵 Copy Fields action triggered at:", new Date().toISOString());
      window.console.log("📍 Current page URL:", window.location.href);
      window.console.log("📄 Current document title:", document.title);
      
      // Check if we're on morgotools.com
      const isMorgoTools = window.location.href.includes('morgotools.com');
      window.console.log("🌐 Is MorgoTools page?", isMorgoTools);
      
      if (isMorgoTools) {
        window.console.log("🔍 Checking for already saved fields from morgotools.com...");
        chrome.storage.local.get("savedFields", (data) => {
          window.console.log("📦 Data currently in storage:", data.savedFields);
          if (data.savedFields) {
            sendResponse({ success: true, values: data.savedFields });
          } else {
            sendResponse({ success: false, error: "No saved fields found. Click save on the page first." });
          }
        });
        return true;
      }

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
      const isDutchieInventory = window.location.href === 'https://pine.backoffice.dutchie.com/products/inventory';
      const isTestHtml = window.location.href.toLowerCase().includes('test.html');
      const isNetlifyDutchie = window.location.href.includes('morganhondros-interviewtopics.netlify.app/dutchie-new') || 
                              window.location.href.includes('localhost:3001/dutchie-new');
      window.console.log("Checking page type - isTestHtml:", isTestHtml, "URL:", window.location.href.toLowerCase());
      window.console.log("Checking page type - isSimulationForm:", isSimulationForm, "URL:", window.location.href);
      window.console.log("Checking page type - isDutchie:", isDutchie, "URL:", window.location.href);
      window.console.log("Checking page type - isDutchieInventory:", isDutchieInventory, "URL:", window.location.href);
      window.console.log("Checking page type - isNetlifyDutchie:", isNetlifyDutchie, "URL:", window.location.href);

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
      } else if (isNetlifyDutchie) {
        window.console.log("🎯 Detected Netlify Dutchie page. Attempting to paste multiple fields...");
        
        // Get ALL the input elements we need
        const deliveredByInput = document.getElementById('input-input_Delivered by');
        const vendorInput = document.getElementById('input-input_Vendor') || document.getElementById('input-Vendor');
        
        window.console.log("🔍 Looking for input fields...");
        window.console.log("📝 Delivered by input found?", deliveredByInput ? "YES" : "NO");
        window.console.log("🏢 Vendor input found?", vendorInput ? "YES" : "NO");
        
        // Debug: Log all input IDs to help identify correct ones
        window.console.log("📋 All input IDs on page:");
        document.querySelectorAll('input[id]').forEach(input => {
          window.console.log("   - " + input.id);
        });
        
        chrome.storage.local.get("savedFields", (data) => {
          window.console.log("💾 Retrieved saved fields from storage:", data.savedFields);
          let pastedFields = [];
          
          // Paste DRIVERS into "Delivered by" field
          if (deliveredByInput && data.savedFields && data.savedFields.drivers) {
            window.console.log("🚗 Pasting drivers value:", data.savedFields.drivers);
            deliveredByInput.value = data.savedFields.drivers || '';
            deliveredByInput.dispatchEvent(new Event('input', { bubbles: true }));
            deliveredByInput.dispatchEvent(new Event('change', { bubbles: true }));
            pastedFields.push(`Drivers → Delivered by: ${data.savedFields.drivers}`);
          }
          
          // Paste COMPANY into "Vendor" field
          if (vendorInput && data.savedFields && data.savedFields.company) {
            window.console.log("🏢 Pasting company value:", data.savedFields.company);
            vendorInput.value = data.savedFields.company || '';
            vendorInput.dispatchEvent(new Event('input', { bubbles: true }));
            vendorInput.dispatchEvent(new Event('change', { bubbles: true }));
            pastedFields.push(`Company → Vendor: ${data.savedFields.company}`);
          }
          
          if (pastedFields.length > 0) {
            window.console.log("✅ Successfully pasted fields:");
            pastedFields.forEach(field => window.console.log("   - " + field));
            sendResponse({ success: true, message: `Pasted ${pastedFields.length} field(s)` });
          } else {
            window.console.log("⚠️ No fields were pasted");
            window.console.log("   Available data:", data.savedFields ? Object.keys(data.savedFields) : "No saved fields");
            window.console.log("   Missing inputs or data");
            sendResponse({ success: false, error: "Could not paste fields. Check console for details." });
          }
        });
        
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
        
        // First, try to find the input immediately
        const nameInput = document.querySelector('div.MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-adornedStart input[type="search"]');
        window.console.log("Immediate check for search input on Dutchie page:", nameInput);
        window.console.log("Input attributes if found:", nameInput ? { type: nameInput.type, id: nameInput.id, disabled: nameInput.disabled, readOnly: nameInput.readOnly } : "Input not found");

        if (isDutchieInventory && nameInput) {
          window.console.log("Input found immediately on Dutchie inventory page:", nameInput);
          chrome.storage.local.get("savedFields", (data) => {
            window.console.log("Retrieved saved fields for pasting in Dutchie inventory:", data.savedFields);
            if (data.savedFields && data.savedFields.productName) {
              window.console.log("productName to be pasted:", data.savedFields.productName);
              const pasteValue = (input, value) => {
                try {
                  // First attempt: Standard value setting
                  input.value = value || '';
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                  window.console.log("After standard paste attempt, input value is:", input.value);

                  // Check if the value was reset (possible blocking)
                  setTimeout(() => {
                    if (input.value !== value) {
                      window.console.log("Value was reset after standard paste. Possible blocking by Dutchie. Trying fallback method...");
                      // Fallback: Use Object.defineProperty to bypass potential blockers
                      Object.defineProperty(input, 'value', {
                        value: value || '',
                        writable: true
                      });
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                      input.dispatchEvent(new Event('change', { bubbles: true }));
                      window.console.log("After fallback paste attempt, input value is:", input.value);
                    }
                  }, 500);
                } catch (error) {
                  window.console.error("Error during paste operation:", error.message);
                  sendResponse({ success: false, error: "Paste operation failed: " + error.message });
                }
              };
              pasteValue(nameInput, data.savedFields.productName);
              window.console.log("Successfully pasted productName in Dutchie inventory:", data.savedFields.productName);
              sendResponse({ success: true });
            } else {
              window.console.log("No saved fields or productName found in storage:", data.savedFields);
              sendResponse({ success: false, error: "No saved fields or productName found. Please copy the fields first." });
            }
          });
          return true;
        }

        // If the input wasn't found immediately, use MutationObserver
        const observer = new MutationObserver((mutations, obs) => {
          window.console.log("MutationObserver triggered, checking for inputs...");
          if (isDutchieInventory) {
            const nameInput = document.querySelector('div.MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-adornedStart input[type="search"]');
            window.console.log("Search input element found on Dutchie inventory page (via observer):", nameInput);
            window.console.log("Input attributes if found (via observer):", nameInput ? { type: nameInput.type, id: nameInput.id, disabled: nameInput.disabled, readOnly: nameInput.readOnly } : "Input not found");
            if (nameInput) {
              chrome.storage.local.get("savedFields", (data) => {
                window.console.log("Retrieved saved fields for pasting in Dutchie inventory:", data.savedFields);
                if (data.savedFields && data.savedFields.productName) {
                  window.console.log("productName to be pasted:", data.savedFields.productName);
                  const pasteValue = (input, value) => {
                    try {
                      // First attempt: Standard value setting
                      input.value = value || '';
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                      input.dispatchEvent(new Event('change', { bubbles: true }));
                      window.console.log("After standard paste attempt (via observer), input value is:", input.value);

                      // Check if the value was reset (possible blocking)
                      setTimeout(() => {
                        if (input.value !== value) {
                          window.console.log("Value was reset after standard paste (via observer). Possible blocking by Dutchie. Trying fallback method...");
                          // Fallback: Use Object.defineProperty to bypass potential blockers
                          Object.defineProperty(input, 'value', {
                            value: value || '',
                            writable: true
                          });
                          input.dispatchEvent(new Event('input', { bubbles: true }));
                          input.dispatchEvent(new Event('change', { bubbles: true }));
                          window.console.log("After fallback paste attempt (via observer), input value is:", input.value);
                        }
                      }, 500);
                    } catch (error) {
                      window.console.error("Error during paste operation (via observer):", error.message);
                      sendResponse({ success: false, error: "Paste operation failed: " + error.message });
                    }
                  };
                  pasteValue(nameInput, data.savedFields.productName);
                  window.console.log("Successfully pasted productName in Dutchie inventory (via observer):", data.savedFields.productName);
                  sendResponse({ success: true });
                } else {
                  window.console.log("No saved fields or productName found in storage:", data.savedFields);
                  sendResponse({ success: false, error: "No saved fields or productName found. Please copy the fields first." });
                }
              });
              obs.disconnect();
            }
          } else {
            const daysSupplyInput = document.querySelector('input[name="daysSupply"]');
            const thcInput = document.querySelector('input[name="thc"]');
            const cbdInput = document.querySelector('input[name="cbd"]');
            window.console.log("Found Dutchie input elements:", { daysSupplyInput, thcInput, cbdInput });
            if (daysSupplyInput && thcInput && cbdInput) {
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
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
          observer.disconnect();
          const daysSupplyInput = document.querySelector('input[name="daysSupply"]');
          const nameInput = document.querySelector('div.MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-adornedStart input[type="search"]');
          if (!daysSupplyInput && !nameInput) {
            window.console.log("Failed to find required inputs in Dutchie after 15 seconds. Final check for search input:", nameInput);
            sendResponse({ 
              success: false, 
              error: "Required inputs not found on Dutchie page after 15 seconds."
            });
          }
        }, 15000);
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