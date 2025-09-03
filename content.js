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
    } else if (request.action === "pasteFields" || request.action === "pasteMainPage" || request.action === "pasteModal" || request.action === "pasteProductSpecific") {
      window.console.log("Paste Fields action triggered at:", new Date().toISOString());
      window.console.log("Current page URL:", window.location.href);

      const isSimulationForm = window.location.href.includes('dut-simulation') || window.location.href.includes('dutsimulation');
      const isDutchie = window.location.href.includes('dutchie.com');
      const isDutchieInventory = window.location.href === 'https://pine.backoffice.dutchie.com/products/inventory';
      const isTestHtml = window.location.href.toLowerCase().includes('test.html');
      const isNetlifyDutchie = window.location.href.includes('morganhondros-interviewtopics.netlify.app/dutchie-new') || 
                              window.location.href.includes('localhost:3001/dutchie-new') ||
                              window.location.href.includes('localhost:3000/dutchie-new');
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
        window.console.log("🎯 Detected Netlify Dutchie page. Action:", request.action);
        
        // Debug: Log all input IDs to help identify correct ones
        window.console.log("📋 All input IDs on page:");
        document.querySelectorAll('input[id]').forEach(input => {
          window.console.log("   - " + input.id);
        });
        
        if (request.action === "pasteMainPage" || request.action === "pasteFields") {
          window.console.log("📄 Pasting Main Page fields...");
          
          // Get main page input elements
          const deliveredByInput = document.getElementById('input-input_Delivered by');
          const vendorInput = document.getElementById('input-input_Vendor') || document.getElementById('input-Vendor');
          
          chrome.storage.local.get("savedFields", (data) => {
            let pastedFields = [];
            
            // Paste DRIVERS into "Delivered by" field
            if (deliveredByInput && data.savedFields && data.savedFields.drivers) {
              window.console.log("🚗 Pasting drivers value:", data.savedFields.drivers);
              deliveredByInput.value = data.savedFields.drivers || '';
              deliveredByInput.dispatchEvent(new Event('input', { bubbles: true }));
              deliveredByInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Drivers → Delivered by`);
            }
            
            // Paste COMPANY into "Vendor" field
            if (vendorInput && data.savedFields && data.savedFields.company) {
              window.console.log("🏢 Pasting company value:", data.savedFields.company);
              vendorInput.value = data.savedFields.company || '';
              vendorInput.dispatchEvent(new Event('input', { bubbles: true }));
              vendorInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Company → Vendor`);
            }
            
            if (pastedFields.length > 0) {
              sendResponse({ success: true, message: `Main Page: ${pastedFields.join(', ')}` });
            } else {
              sendResponse({ success: false, error: "No main page fields could be pasted." });
            }
          });
          
        } else if (request.action === "pasteModal") {
          window.console.log("🎭 Pasting Modal fields...");
          
          // Get modal input elements
          const packageNdcInput = document.getElementById('input-input_Package NDC');
          const packageIdInput = document.getElementById('input-input_Package ID');
          const expirationDateInput = document.getElementById('input-input_Expiration date');
          const costPerUnitInput = document.getElementById('input-input_Cost per unit');
          window.console.log("📦 Package NDC input found?", packageNdcInput ? "YES" : "NO");
          window.console.log("🆔 Package ID input found?", packageIdInput ? "YES" : "NO");
          window.console.log("📅 Expiration Date input found?", expirationDateInput ? "YES" : "NO");
          window.console.log("💰 Cost per Unit input found?", costPerUnitInput ? "YES" : "NO");
          
          chrome.storage.local.get("savedFields", (data) => {
            let pastedFields = [];
            
            // Paste M NUMBER into "Package NDC" field
            if (packageNdcInput && data.savedFields && data.savedFields.mNumber) {
              window.console.log("🏷️ Pasting mNumber value:", data.savedFields.mNumber);
              packageNdcInput.value = data.savedFields.mNumber || '';
              packageNdcInput.dispatchEvent(new Event('input', { bubbles: true }));
              packageNdcInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`M Number → Package NDC`);
              window.console.log("✅ Successfully pasted mNumber into Package NDC field");
            } else if (!packageNdcInput) {
              window.console.log("❌ Package NDC input not found");
            } else if (!data.savedFields?.mNumber) {
              window.console.log("⚠️ No mNumber field in saved data");
            }
            
            // Paste PACKAGE ID into "Package ID" field
            if (packageIdInput && data.savedFields && data.savedFields.packageId) {
              window.console.log("📦 Pasting packageId value:", data.savedFields.packageId);
              packageIdInput.value = data.savedFields.packageId || '';
              packageIdInput.dispatchEvent(new Event('input', { bubbles: true }));
              packageIdInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Package ID → Package ID`);
              window.console.log("✅ Successfully pasted packageId into Package ID field");
            } else if (!packageIdInput) {
              window.console.log("❌ Package ID input not found");
            } else if (!data.savedFields?.packageId) {
              window.console.log("⚠️ No packageId field in saved data");
            }
            
            // Paste EXPIRATION DATE into "Expiration date" field
            if (expirationDateInput && data.savedFields && data.savedFields.expirationDate) {
              window.console.log("📅 Pasting expirationDate value:", data.savedFields.expirationDate);
              expirationDateInput.value = data.savedFields.expirationDate || '';
              expirationDateInput.dispatchEvent(new Event('input', { bubbles: true }));
              expirationDateInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Expiration Date → Expiration date`);
              window.console.log("✅ Successfully pasted expirationDate into Expiration date field");
            } else if (!expirationDateInput) {
              window.console.log("❌ Expiration Date input not found");
            } else if (!data.savedFields?.expirationDate) {
              window.console.log("⚠️ No expirationDate field in saved data");
            }
            
            // Paste COST into "Cost per unit" field
            if (costPerUnitInput && data.savedFields && data.savedFields.cost) {
              window.console.log("💰 Pasting cost value:", data.savedFields.cost);
              costPerUnitInput.value = data.savedFields.cost || '';
              costPerUnitInput.dispatchEvent(new Event('input', { bubbles: true }));
              costPerUnitInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Cost → Cost per unit`);
              window.console.log("✅ Successfully pasted cost into Cost per unit field");
            } else if (!costPerUnitInput) {
              window.console.log("❌ Cost per unit input not found");
            } else if (!data.savedFields?.cost) {
              window.console.log("⚠️ No cost field in saved data");
            }
            
            if (pastedFields.length > 0) {
              sendResponse({ success: true, message: `Modal: ${pastedFields.join(', ')}` });
            } else {
              sendResponse({ success: false, error: "No modal fields could be pasted." });
            }
          });
          
        } else if (request.action === "pasteProductSpecific") {
          window.console.log("🛍️ Pasting Product Specific fields...");
          window.console.log("📍 Current URL:", window.location.href);
          
          // Get product specific input elements
          const nameInput = document.getElementById('input-input_Name:');
          const skuInput = document.getElementById('input-input_SKU:');
          const ndcInput = document.getElementById('input-input_NDC:');
          const daysSupplyInput = document.getElementById('input-input_Days supply:');
          const thcContentInput = document.getElementById('input-input_THC content:');
          const cbdContentInput = document.getElementById('input-input_CBD content:');
          const gramsConcentrationInput = document.getElementById('input-input_Grams / concentration:');
          const netWeightInput = document.getElementById('input-input_Net weight:');
          const grossWeightInput = document.getElementById('input-input_Gross weight:');
          const masterCategoryInput = document.getElementById('input-input_Master category:');
          const categoryInput = document.getElementById('input-input_catalog-tags');
          const strainInput = document.getElementById('input-input_Strain:');
          const brandInput = document.getElementById('input-input_Brand:');
          const vendorInput = document.getElementById('input-input_Vendor:');
          const basePriceInput = document.getElementById('input-input_Base price:');
          const costInput = document.getElementById('input-input_Cost:');
          
          window.console.log("📝 Name input found?", nameInput ? "YES" : "NO");
          window.console.log("🏷️ SKU input found?", skuInput ? "YES" : "NO");
          window.console.log("🔢 NDC input found?", ndcInput ? "YES" : "NO");
          window.console.log("📅 Days supply input found?", daysSupplyInput ? "YES" : "NO");
          window.console.log("🌿 THC content input found?", thcContentInput ? "YES" : "NO");
          window.console.log("🌱 CBD content input found?", cbdContentInput ? "YES" : "NO");
          window.console.log("⚖️ Grams/concentration input found?", gramsConcentrationInput ? "YES" : "NO");
          window.console.log("📏 Net weight input found?", netWeightInput ? "YES" : "NO");
          window.console.log("⚖️ Gross weight input found?", grossWeightInput ? "YES" : "NO");
          window.console.log("🗂️ Master category input found?", masterCategoryInput ? "YES" : "NO");
          window.console.log("🏷️ Category input found?", categoryInput ? "YES" : "NO");
          window.console.log("🌾 Strain input found?", strainInput ? "YES" : "NO");
          window.console.log("🏢 Brand input found?", brandInput ? "YES" : "NO");
          window.console.log("🏪 Vendor input found?", vendorInput ? "YES" : "NO");
          window.console.log("💰 Base price input found?", basePriceInput ? "YES" : "NO");
          window.console.log("💵 Cost input found?", costInput ? "YES" : "NO");
          
          chrome.storage.local.get("savedFields", (data) => {
            window.console.log("📦 DEBUG - Retrieved data from storage:", data.savedFields);
            if (data.savedFields) {
              window.console.log("   Available fields:", Object.keys(data.savedFields));
              window.console.log("   Weight value:", data.savedFields.weight);
              window.console.log("   Company value:", data.savedFields.company);
              window.console.log("   Type value:", data.savedFields.type);
            } else {
              window.console.log("❌ No saved fields found in storage!");
            }
            
            let pastedFields = [];
            
            // Create formatted Name: {{Company}} | {{Type}} | {{Weight}} | {{THC}} | {{Strain}}
            if (nameInput && data.savedFields) {
              const company = data.savedFields.company || '';
              const type = data.savedFields.type || '';
              const weight = data.savedFields.weight || '';
              const thc = data.savedFields.thc || '';
              const strain = data.savedFields.strain || '';
              
              const formattedName = `${company} | ${type} | ${weight} | ${thc} | ${strain}`;
              window.console.log("📝 Creating formatted name:", formattedName);
              
              nameInput.value = formattedName;
              nameInput.dispatchEvent(new Event('input', { bubbles: true }));
              nameInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Formatted Name`);
              window.console.log("✅ Successfully pasted formatted name");
            } else if (!nameInput) {
              window.console.log("❌ Name input not found");
            }
            
            // Paste M NUMBER into SKU field
            if (skuInput && data.savedFields && data.savedFields.mNumber) {
              window.console.log("🏷️ Pasting mNumber into SKU:", data.savedFields.mNumber);
              skuInput.value = data.savedFields.mNumber || '';
              skuInput.dispatchEvent(new Event('input', { bubbles: true }));
              skuInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`M Number → SKU`);
              window.console.log("✅ Successfully pasted mNumber into SKU field");
            } else if (!skuInput) {
              window.console.log("❌ SKU input not found");
            } else if (!data.savedFields?.mNumber) {
              window.console.log("⚠️ No mNumber field in saved data");
            }
            
            // Paste M NUMBER into NDC field
            if (ndcInput && data.savedFields && data.savedFields.mNumber) {
              window.console.log("🔢 Pasting mNumber into NDC:", data.savedFields.mNumber);
              ndcInput.value = data.savedFields.mNumber || '';
              ndcInput.dispatchEvent(new Event('input', { bubbles: true }));
              ndcInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`M Number → NDC`);
              window.console.log("✅ Successfully pasted mNumber into NDC field");
            } else if (!ndcInput) {
              window.console.log("❌ NDC input not found");
            } else if (!data.savedFields?.mNumber) {
              window.console.log("⚠️ No mNumber field in saved data");
            }
            
            // Paste DAYS SUPPLY into "Days supply" field
            if (daysSupplyInput && data.savedFields && data.savedFields.daysSupply) {
              daysSupplyInput.value = data.savedFields.daysSupply || '';
              daysSupplyInput.dispatchEvent(new Event('input', { bubbles: true }));
              daysSupplyInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Days Supply`);
              window.console.log("✅ Successfully pasted daysSupply");
            }
            
            // Paste THC into "THC content" field
            if (thcContentInput && data.savedFields && data.savedFields.thc) {
              thcContentInput.value = data.savedFields.thc || '';
              thcContentInput.dispatchEvent(new Event('input', { bubbles: true }));
              thcContentInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`THC Content`);
              window.console.log("✅ Successfully pasted THC");
            }
            
            // Paste CBD into "CBD content" field
            if (cbdContentInput && data.savedFields && data.savedFields.cbd) {
              cbdContentInput.value = data.savedFields.cbd || '';
              cbdContentInput.dispatchEvent(new Event('input', { bubbles: true }));
              cbdContentInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`CBD Content`);
              window.console.log("✅ Successfully pasted CBD");
            }
            
            // Paste WEIGHT into "Grams / concentration" field
            if (gramsConcentrationInput) {
              window.console.log("🔍 Grams/concentration input exists, weight data:", data.savedFields?.weight);
              if (data.savedFields && data.savedFields.weight) {
                window.console.log("📊 Pasting weight '", data.savedFields.weight, "' into Grams/concentration");
                gramsConcentrationInput.value = data.savedFields.weight || '';
                gramsConcentrationInput.dispatchEvent(new Event('input', { bubbles: true }));
                gramsConcentrationInput.dispatchEvent(new Event('change', { bubbles: true }));
                pastedFields.push(`Grams/Concentration`);
                window.console.log("✅ Successfully pasted weight into Grams/concentration, new value:", gramsConcentrationInput.value);
              } else {
                window.console.log("⚠️ No weight data found for Grams/concentration");
              }
            } else {
              window.console.log("❌ Grams/concentration input not found with ID 'input-input_Grams / concentration:'");
            }
            
            // Paste WEIGHT into "Net weight" field
            if (netWeightInput && data.savedFields && data.savedFields.weight) {
              netWeightInput.value = data.savedFields.weight || '';
              netWeightInput.dispatchEvent(new Event('input', { bubbles: true }));
              netWeightInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Net Weight`);
              window.console.log("✅ Successfully pasted weight into Net weight");
            }
            
            // Paste WEIGHT into "Gross weight" field
            if (grossWeightInput && data.savedFields && data.savedFields.weight) {
              grossWeightInput.value = data.savedFields.weight || '';
              grossWeightInput.dispatchEvent(new Event('input', { bubbles: true }));
              grossWeightInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Gross Weight`);
              window.console.log("✅ Successfully pasted weight into Gross weight");
            }
            
            // Paste TYPE into "Master category" field
            if (masterCategoryInput && data.savedFields && data.savedFields.type) {
              masterCategoryInput.value = data.savedFields.type || '';
              masterCategoryInput.dispatchEvent(new Event('input', { bubbles: true }));
              masterCategoryInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Master Category`);
              window.console.log("✅ Successfully pasted type into Master category");
            }
            
            // Paste TYPE into "Category" field (dropdown converted to editable input)
            if (categoryInput && data.savedFields && data.savedFields.type) {
              categoryInput.value = data.savedFields.type || '';
              categoryInput.dispatchEvent(new Event('input', { bubbles: true }));
              categoryInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Category`);
              window.console.log("✅ Successfully pasted type into Category");
            }
            
            // Paste STRAIN into "Strain" field
            if (strainInput && data.savedFields && data.savedFields.strain) {
              strainInput.value = data.savedFields.strain || '';
              strainInput.dispatchEvent(new Event('input', { bubbles: true }));
              strainInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Strain`);
              window.console.log("✅ Successfully pasted strain");
            }
            
            // Paste COMPANY into "Brand" field
            if (brandInput && data.savedFields && data.savedFields.company) {
              brandInput.value = data.savedFields.company || '';
              brandInput.dispatchEvent(new Event('input', { bubbles: true }));
              brandInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Brand`);
              window.console.log("✅ Successfully pasted company into Brand");
            }
            
            // Paste COMPANY into "Vendor" field
            if (vendorInput && data.savedFields && data.savedFields.company) {
              vendorInput.value = data.savedFields.company || '';
              vendorInput.dispatchEvent(new Event('input', { bubbles: true }));
              vendorInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Vendor`);
              window.console.log("✅ Successfully pasted company into Vendor");
            }
            
            // Paste COST × 2 into "Base price" field
            if (basePriceInput && data.savedFields && data.savedFields.cost) {
              const costValue = parseFloat(data.savedFields.cost) || 0;
              const basePriceValue = costValue * 2;
              window.console.log("💰 Calculating base price: ", data.savedFields.cost, "× 2 =", basePriceValue);
              basePriceInput.value = basePriceValue.toString();
              basePriceInput.dispatchEvent(new Event('input', { bubbles: true }));
              basePriceInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Base Price`);
              window.console.log("✅ Successfully pasted cost × 2 into Base price:", basePriceValue);
            }
            
            // Paste COST into "Cost" field
            if (costInput && data.savedFields && data.savedFields.cost) {
              window.console.log("💵 Pasting regular cost:", data.savedFields.cost);
              costInput.value = data.savedFields.cost || '';
              costInput.dispatchEvent(new Event('input', { bubbles: true }));
              costInput.dispatchEvent(new Event('change', { bubbles: true }));
              pastedFields.push(`Cost`);
              window.console.log("✅ Successfully pasted cost into Cost field");
            }
            
            if (pastedFields.length > 0) {
              sendResponse({ success: true, message: `Product Specific: ${pastedFields.join(', ')}` });
            } else {
              sendResponse({ success: false, error: "No product specific fields could be pasted." });
            }
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