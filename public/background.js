
// Firebase SDKs are imported in offscreen.js

let creating; // Promise for offscreen document creation

// Function to setup and get the offscreen document
async function getOffscreenDocument() {
  // Check if we already have an offscreen document
  if (await chrome.offscreen.hasDocument()) {
    return;
  }

  // If a creation promise is pending, wait for it
  if (creating) {
    await creating;
  } else {
    // Create a new offscreen document
    creating = chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.FIREBASE],
      justification: 'Firebase auth requires an offscreen document in Manifest V3.',
    });
    await creating;
    creating = null;
  }
}

// Listen for messages from the popup or other parts of the extension
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'firebase-auth') {
    // Ensure the offscreen document is ready
    await getOffscreenDocument();

    // Forward the message to the offscreen document and await a response
    const response = await chrome.runtime.sendMessage({
      ...message,
      target: 'offscreen',
    });
    
    // Send the response back to the original caller (popup)
    sendResponse(response);
    return true; // Indicates that the response is sent asynchronously
  }
});
