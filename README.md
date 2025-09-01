# Morgo Tools Build - Chrome Extension

A Chrome extension that automates data transfer between cannabis inventory management systems, streamlining the process of copying product information from BuildingScan pages and pasting it into various destination platforms.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Supported Platforms](#supported-platforms)
- [Installation](#installation)
- [Usage](#usage)
- [Technical Details](#technical-details)
- [Field Mappings](#field-mappings)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

## Overview

Morgo Tools Build is designed to eliminate manual data entry in cannabis dispensary operations by automating the transfer of product information between different inventory and compliance systems. The extension captures product data from source pages and intelligently pastes it into target applications, maintaining data integrity and saving time.

## Features

- **Automated Data Capture**: Extracts product information from scanned PDFs on morgotools.com
- **Multi-Platform Support**: Works with multiple cannabis industry platforms
- **Smart Field Mapping**: Intelligently maps fields between different systems
- **Persistent Storage**: Saves data locally for reliable transfer between sites
- **Tab-Aware Pasting**: Detects active tabs in multi-tab forms and pastes relevant fields
- **Error Handling**: Comprehensive error messages and logging for debugging

## Supported Platforms

### Source Platforms
1. **morgotools.com/building**
   - PDF scanning and data extraction
   - Automatic field population
   - Save functionality that locks data for transfer

### Destination Platforms
1. **DutSimulationForm** (URLs containing `dut-simulation` or `dutsimulation`)
   - Multi-tab support (main, productOuter, productInner)
   - Conditional field rendering support
   - Tab-specific field pasting

2. **Dutchie POS System**
   - Main domain: `dutchie.com`
   - Inventory page: `pine.backoffice.dutchie.com/products/inventory`
   - Product search functionality

3. **Netlify Dutchie Interface**
   - URL: `morganhondros-interviewtopics.netlify.app/dutchie-new`
   - Driver/delivery information support

4. **Test Pages**
   - Any URL containing `test.html`
   - Used for development and testing

## Installation

### From Source (Development)

1. **Clone or download this repository**
   ```bash
   git clone [repository-url]
   cd BuildExtenstion
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or use Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `BuildExtenstion` folder
   - The extension should appear in your extensions list

5. **Verify Installation**
   - Look for "Morgo Tools Build" in your extensions
   - Ensure it shows as "On"
   - Pin the extension for easy access

## Usage

### Workflow for morgotools.com

1. **Navigate to Source Page**
   - Go to `morgotools.com/building`
   - Scan your PDF document
   - Review the extracted data in the form fields

2. **Save Data**
   - Click the save button on the morgotools.com page
   - This locks the data and sends it to the extension
   - The extension automatically stores the data

3. **Navigate to Destination**
   - Open your target platform (DutSimulationForm, Dutchie, etc.)
   - Navigate to the appropriate data entry page

4. **Paste Data**
   - Click the extension icon in Chrome toolbar
   - Click "Paste Fields" button
   - Data will be automatically filled into the appropriate fields

### Manual Copy/Paste Workflow

For pages with compatible field IDs:

1. **Copy Data**
   - Navigate to a page with the required input fields
   - Click the extension icon
   - Click "Copy Fields"
   - Extension will extract values from available fields

2. **Paste Data**
   - Navigate to destination page
   - Click the extension icon
   - Click "Paste Fields"

## Technical Details

### Architecture

The extension consists of:
- **Content Script** (`content.js`): Injected into all pages, handles field detection and data manipulation
- **Popup Interface** (`popup.html/js`): User interface for copy/paste actions
- **Manifest** (`manifest.json`): Extension configuration and permissions

### Data Flow

1. **Data Collection**:
   - morgotools.com sends `SAVE_FIELDS` message via `window.postMessage`
   - Extension listens for this message and stores data in `chrome.storage.local`

2. **Data Storage**:
   - Uses Chrome's local storage API
   - Data persists across browser sessions
   - Structured as key-value pairs for each field

3. **Data Retrieval**:
   - Extension reads from storage when paste is triggered
   - Maps stored fields to target input elements
   - Dispatches events to trigger form validation

### Communication Methods

- **Window Messages**: For receiving data from morgotools.com
- **Chrome Runtime Messages**: For popup-to-content script communication
- **Chrome Storage API**: For persistent data storage

## Field Mappings

### Core Fields

| Field Name | Source ID | Description | Supported Platforms |
|------------|-----------|-------------|-------------------|
| packageId | `packageId` | Package identifier | DutSimulationForm |
| mNumber | `mNumber` | M-number identifier | DutSimulationForm |
| productName | `productName` | Product name/title | All platforms |
| daysSupply | `daysSupplyInput` / `daysSupply` | Days supply value | All platforms |
| thc | `thc` | THC percentage | All platforms |
| cbd | `cbd` | CBD percentage | All platforms |
| type | `type` | Product type (Flower, Edible, etc.) | DutSimulationForm |
| strain | `strain` | Cannabis strain | DutSimulationForm |
| weight | `weight` | Product weight | DutSimulationForm |

### Platform-Specific Fields

| Field Name | Platform | Element ID | Notes |
|------------|----------|------------|-------|
| drivers | DutSimulationForm | `drivers` | Main tab only |
| company | DutSimulationForm | `company` | Main tab only |
| drivers | Netlify Dutchie | `input-input_Delivered by` | Delivery personnel |
| expirationDate | DutSimulationForm | `expirationDate` | ProductOuter tab |
| flowerEquivalent | DutSimulationForm | `flowerEquivalent` | ProductOuter tab |
| cost | DutSimulationForm | `cost` | ProductOuter tab |
| subType | DutSimulationForm | `subType` | Conditional rendering |

## Development

### Prerequisites
- Chrome browser (version 88 or higher)
- Basic understanding of Chrome Extensions
- Text editor for code modifications

### Debug Logging

The extension includes comprehensive logging. To view logs:

1. Open DevTools (F12) on the target page
2. Navigate to Console tab
3. Look for messages with these prefixes:
   - `📨` - Message received
   - `✅` - Success operations
   - `❌` - Errors
   - `🔍` - Data verification
   - `📦` - Data content
   - `🔵` - Copy action
   - `📍` - Location info

### Testing

1. **Test Page Setup**:
   - Create an HTML file with `test.html` in the name
   - Add input fields with appropriate IDs
   - Use for isolated testing

2. **Console Commands**:
   ```javascript
   // Check stored data
   chrome.storage.local.get('savedFields', (data) => console.log(data));
   
   // Clear stored data
   chrome.storage.local.clear();
   
   // Send test message
   window.postMessage({ type: 'SAVE_FIELDS', data: { productName: 'Test Product' } }, '*');
   ```

## Troubleshooting

### Extension Not Loading
- Ensure Developer Mode is enabled
- Check for errors in chrome://extensions
- Verify manifest.json is valid JSON

### No Console Logs Appearing
1. Check if extension is enabled
2. Refresh the page after loading extension
3. Verify content script injection:
   ```javascript
   // In DevTools console
   console.log(window.hasOwnProperty('chrome'));
   ```

### Copy/Paste Not Working

**Copy Issues:**
- Verify field IDs match expected values
- Check console for error messages
- Ensure page has fully loaded before copying

**Paste Issues:**
- Confirm data was successfully copied first
- Check if target page URL matches supported patterns
- Verify target input elements exist and are not disabled

### Storage Issues
- Check Chrome storage quota (not exceeded)
- Verify permissions in manifest.json
- Try clearing storage and re-copying:
  ```javascript
  chrome.storage.local.clear(() => console.log('Storage cleared'));
  ```

### morgotools.com Integration Issues
1. Ensure the page sends `SAVE_FIELDS` message
2. Check message origin is not blocked
3. Verify data structure matches expected format

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No saved fields found" | Data not in storage | Copy/save data first |
| "Required inputs not found" | Target elements missing | Wait for page to load fully |
| "chrome.storage.local is not available" | Permission issue | Reload extension |
| "Page not recognized for pasting" | URL pattern not matched | Check supported platforms |

## Project Structure

```
BuildExtenstion/
├── manifest.json           # Extension configuration
├── content.js             # Main content script
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── logo.png              # Extension icon
└── README.md             # This file
```

### File Descriptions

- **manifest.json**: Defines extension metadata, permissions, and content script injection rules
- **content.js**: Core logic for field detection, data extraction, and form filling
- **popup.html/js**: User interface for triggering copy/paste operations
- **popup.css**: Styling for the extension popup

## Security Considerations

- Extension only stores data locally using Chrome's storage API
- No data is sent to external servers
- Sensitive information should not be stored in fields
- Uses content script isolation for security

## Version History

- **1.0**: Initial release with basic copy/paste functionality
- Multi-platform support
- Netlify Dutchie integration added
- Enhanced error handling and logging

## Support

For issues, questions, or feature requests:
1. Check the Troubleshooting section
2. Review console logs for detailed error information
3. Ensure you're using the latest version of the extension

## License

[Specify your license here]

---

*Last updated: 2025*